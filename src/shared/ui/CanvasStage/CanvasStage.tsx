import { useEffect, useMemo, useRef, useState } from 'react';
import type { Polygon as MetaPolygon, Transform } from '../../types/metadata';

type StageOverlay = {
  src: string;
  imageTransform?: Transform;
  opacity?: number;
};

type StagePolygon = MetaPolygon & {
  stroke?: string;
  fill?: string;
  fillOpacity?: number;
  strokeWidth?: number;
};

export type CanvasStageProps = {
  width: number;
  height: number;
  baseSrc: string;

  overlays?: StageOverlay[];
  polygons?: StagePolygon[];
  onPolygonClick?: (index: number) => void;

  view?: {
    scale: number;
    offsetX: number;
    offsetY: number;
  };

  debug?: boolean;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Apply metadata transform in world space.
 * (x, y) is treated as pivot in base image coordinates.
 */
const applyWorldTransform = (ctx: CanvasRenderingContext2D, t?: Transform) => {
  if (!t) return;
  ctx.translate(t.x, t.y);
  ctx.rotate(t.rotation);
  ctx.scale(t.scale, t.scale);
  ctx.translate(-t.x, -t.y);
};

const calcContainView = (baseW: number, baseH: number, viewportW: number, viewportH: number) => {
  const scale = Math.min(viewportW / baseW, viewportH / baseH);
  return {
    scale,
    offsetX: (viewportW - baseW * scale) / 2,
    offsetY: (viewportH - baseH * scale) / 2,
  };
};

export const CanvasStage = ({
  width,
  height,
  baseSrc,
  overlays = [],
  polygons = [],
  onPolygonClick,
  view,
  debug = false,
}: CanvasStageProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [baseImg, setBaseImg] = useState<HTMLImageElement | null>(null);
  const [overlayImgs, setOverlayImgs] = useState<Record<string, HTMLImageElement>>({});

  /** Load base image */
  useEffect(() => {
    let cancelled = false;
    loadImage(baseSrc)
      .then((img) => !cancelled && setBaseImg(img))
      .catch(() => !cancelled && setBaseImg(null));
    return () => {
      cancelled = true;
    };
  }, [baseSrc]);

  /** Load overlay images (cached by src) */
  useEffect(() => {
    let cancelled = false;
    const uniqueSrcs = Array.from(new Set(overlays.map((o) => o.src)));
    if (uniqueSrcs.length === 0) return;

    Promise.all(
      uniqueSrcs.map(async (src) => {
        try {
          return [src, await loadImage(src)] as const;
        } catch {
          return [src, null] as const;
        }
      }),
    ).then((pairs) => {
      if (cancelled) return;
      setOverlayImgs((prev) => {
        const next = { ...prev };
        for (const [src, img] of pairs) {
          if (img) next[src] = img;
        }
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [overlays]);

  const computedView = useMemo(() => {
    if (!baseImg) return null;
    return view ?? calcContainView(baseImg.width, baseImg.height, width, height);
  }, [baseImg, view, width, height]);

  /**
   * DRAW
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !baseImg || !computedView) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(computedView.offsetX, computedView.offsetY);
    ctx.scale(computedView.scale, computedView.scale);

    // Base
    ctx.drawImage(baseImg, 0, 0);

    // Overlays
    for (const o of overlays) {
      const img = overlayImgs[o.src];
      if (!img) continue;
      ctx.save();
      applyWorldTransform(ctx, o.imageTransform);
      ctx.globalAlpha = o.opacity ?? 0.5;
      ctx.drawImage(img, 0, 0, baseImg.width, baseImg.height);
      ctx.restore();
    }

    // Polygons
    for (const p of polygons) {
      if (!p.vertices || p.vertices.length < 2) continue;

      ctx.save();
      applyWorldTransform(ctx, p.polygonTransform);

      ctx.beginPath();
      ctx.moveTo(p.vertices[0][0], p.vertices[0][1]);
      for (let i = 1; i < p.vertices.length; i++) {
        ctx.lineTo(p.vertices[i][0], p.vertices[i][1]);
      }
      ctx.closePath();

      ctx.globalAlpha = p.fillOpacity ?? 1;
      ctx.fillStyle = p.fill ?? 'rgba(0,128,255,0.15)';
      ctx.fill();

      ctx.strokeStyle = p.stroke ?? 'rgba(0,128,255,0.9)';
      ctx.lineWidth = p.strokeWidth ?? 2;
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }, [baseImg, overlays, overlayImgs, polygons, computedView, width, height, debug]);

  /**
   * HIT TEST (click)
   * Must mirror draw transform order exactly.
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onPolygonClick || !computedView) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();

      // Screen -> world coordinates
      const wx = (e.clientX - rect.left - computedView.offsetX) / computedView.scale;
      const wy = (e.clientY - rect.top - computedView.offsetY) / computedView.scale;

      for (let i = polygons.length - 1; i >= 0; i--) {
        const p = polygons[i];
        if (!p.vertices || p.vertices.length < 2) continue;

        ctx.save();
        applyWorldTransform(ctx, p.polygonTransform);

        ctx.beginPath();
        ctx.moveTo(p.vertices[0][0], p.vertices[0][1]);
        for (let j = 1; j < p.vertices.length; j++) {
          ctx.lineTo(p.vertices[j][0], p.vertices[j][1]);
        }
        ctx.closePath();

        const hit = ctx.isPointInPath(wx, wy);
        ctx.restore();

        if (hit) {
          onPolygonClick(i);
          return;
        }
      }
    };

    canvas.addEventListener('click', handleClick);
    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [polygons, onPolygonClick, computedView]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        background: '#f5f5f5',
        width,
        height,
      }}
    />
  );
};
