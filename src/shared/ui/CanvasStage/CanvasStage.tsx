import { useEffect, useMemo, useRef, useState } from 'react';
import type { Polygon as MetaPolygon, Transform } from '../../types/metadata';

type StageOverlay = {
  /** image src (e.g. /drawings/01_xxx.png) */
  src: string;
  /** metadata imageTransform (optional) */
  imageTransform?: Transform;
  opacity?: number; // 0~1
};

type StagePolygon = MetaPolygon & {
  stroke?: string;
  fill?: string;
  fillOpacity?: number; // 0~1
  strokeWidth?: number; // in world(px) units
};

export type CanvasStageProps = {
  width: number; // css px
  height: number; // css px

  /** base/reference image */
  baseSrc: string;

  overlays?: StageOverlay[];
  polygons?: StagePolygon[];

  /**
   * If you later add pan/zoom, pass them in.
   * World coordinate system = base image pixel coordinate system.
   */
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
 * NOTE: We treat (x, y) as the pivot in the *world/base* coordinate system.
 */
const applyWorldTransform = (ctx: CanvasRenderingContext2D, t?: Transform) => {
  if (!t) return;

  // rotate/scale around pivot
  ctx.translate(t.x, t.y);
  ctx.rotate(t.rotation);
  ctx.scale(t.scale, t.scale);
  ctx.translate(-t.x, -t.y);
};

const calcContainView = (
  baseW: number,
  baseH: number,
  viewportW: number,
  viewportH: number,
): { scale: number; offsetX: number; offsetY: number } => {
  const s = Math.min(viewportW / baseW, viewportH / baseH);
  const offsetX = (viewportW - baseW * s) / 2;
  const offsetY = (viewportH - baseH * s) / 2;
  return { scale: s, offsetX, offsetY };
};

export const CanvasStage = ({
  width,
  height,
  baseSrc,
  overlays = [],
  polygons = [],
  view,
  debug = false,
}: CanvasStageProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [baseImg, setBaseImg] = useState<HTMLImageElement | null>(null);
  const [overlayImgs, setOverlayImgs] = useState<Record<string, HTMLImageElement>>({});

  // Load base image
  useEffect(() => {
    let cancelled = false;

    loadImage(baseSrc)
      .then((img) => {
        if (!cancelled) setBaseImg(img);
      })
      .catch(() => {
        if (!cancelled) setBaseImg(null);
      });

    return () => {
      cancelled = true;
    };
  }, [baseSrc]);

  // Load overlay images (cache by src)
  useEffect(() => {
    let cancelled = false;

    const uniqueSrcs = Array.from(new Set(overlays.map((o) => o.src))).filter(Boolean);
    if (uniqueSrcs.length === 0) return;

    Promise.all(
      uniqueSrcs.map(async (src) => {
        try {
          const img = await loadImage(src);
          return [src, img] as const;
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
    if (view) return view;
    return calcContainView(baseImg.width, baseImg.height, width, height);
  }, [baseImg, view, width, height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    if (!baseImg || !computedView) return;

    const dpr = window.devicePixelRatio || 1;

    // Keep canvas crisp on HiDPI screens
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Reset and clear in device pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // World -> screen projection
    ctx.save();
    ctx.translate(computedView.offsetX, computedView.offsetY);
    ctx.scale(computedView.scale, computedView.scale);

    // 1) Base image (world origin is image top-left)
    ctx.drawImage(baseImg, 0, 0);

    // 2) Overlay images
    for (const o of overlays) {
      const img = overlayImgs[o.src];
      if (!img) continue;

      ctx.save();
      applyWorldTransform(ctx, o.imageTransform);
      ctx.globalAlpha = o.opacity ?? 0.5;
      ctx.drawImage(img, 0, 0);
      ctx.restore();
    }

    // 3) Polygons
    for (const p of polygons) {
      if (!p.vertices || p.vertices.length < 2) continue;

      ctx.save();
      applyWorldTransform(ctx, p.polygonTransform);

      const stroke = p.stroke ?? 'rgba(0, 128, 255, 0.9)';
      const fill = p.fill ?? 'rgba(0, 128, 255, 0.15)';
      const fillOpacity = p.fillOpacity ?? 1;
      const strokeWidth = p.strokeWidth ?? 2;

      ctx.beginPath();
      const [x0, y0] = p.vertices[0] as [number, number];
      ctx.moveTo(x0, y0);
      for (let i = 1; i < p.vertices.length; i++) {
        const [x, y] = p.vertices[i] as [number, number];
        ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Fill first for better outline visibility
      ctx.save();
      ctx.globalAlpha = fillOpacity;
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = stroke;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();

      ctx.restore();
    }

    // Debug axes at world origin
    if (debug) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,0,0,0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(200, 0);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(0,255,0,0.8)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 200);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }, [baseImg, overlays, overlayImgs, polygons, computedView, width, height, debug]);

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
