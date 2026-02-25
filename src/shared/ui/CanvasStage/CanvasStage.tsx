import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { Polygon as MetaPolygon, Transform } from '../../types/metadata';
import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

import styles from './CanvasStageControls.module.css';

const POLYGON_FILL = 'rgba(56, 132, 255, 0.22)';
const POLYGON_STROKE = 'rgba(56, 132, 255, 0.85)';
const POLYGON_HOVER_FILL = 'rgba(56, 180, 255, 0.38)';
const POLYGON_HOVER_STROKE = 'rgba(120, 210, 255, 1)';
const POLYGON_HOVER_STROKE_WIDTH = 4;

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
  baseSrc: string;
  overlays?: StageOverlay[];
  polygons?: StagePolygon[];
  onPolygonClick?: (index: number) => void;
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

// Must match draw + hit-test path exactly.
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

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export const CanvasStage = ({
  baseSrc,
  overlays = [],
  polygons = [],
  onPolygonClick,
  debug = false,
}: CanvasStageProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [baseImg, setBaseImg] = useState<HTMLImageElement | null>(null);
  const [overlayImgs, setOverlayImgs] = useState<Record<string, HTMLImageElement>>({});
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const [localView, setLocalView] = useState<{
    scale: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);

  // Ref to avoid rerendering on pointer move.
  const dragRef = useRef<{
    dragging: boolean;
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
    pointerId: number | null;
  }>({
    dragging: false,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
    pointerId: null,
  });

  const hitTestPolygon = (
    ctx: CanvasRenderingContext2D,
    polygons: StagePolygon[],
    x: number,
    y: number,
  ): number | null => {
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

      const hit = ctx.isPointInPath(x, y);
      ctx.restore();

      if (hit) return i;
    }
    return null;
  };

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setViewport({
        width: Math.floor(width),
        height: Math.floor(height),
      });
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    loadImage(baseSrc)
      .then((img) => !cancelled && setBaseImg(img))
      .catch(() => !cancelled && setBaseImg(null));
    return () => {
      cancelled = true;
    };
  }, [baseSrc]);

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
    if (!baseImg || viewport.width === 0 || viewport.height === 0) return null;
    if (localView) return localView;
    return calcContainView(baseImg.width, baseImg.height, viewport.width, viewport.height);
  }, [baseImg, localView, viewport]);

  const ZOOM_STEP = 1.2;

  const resetView = () => {
    if (!baseImg) return;
    setLocalView(calcContainView(baseImg.width, baseImg.height, viewport.width, viewport.height));
  };

  const zoomBy = (factor: number) => {
    if (!baseImg || !computedView || !baseContainView) return;

    const MIN_SCALE = baseContainView.scale * 0.5;
    const MAX_SCALE = baseContainView.scale * 5;

    const sx = viewport.width / 2;
    const sy = viewport.height / 2;

    // Screen(center) -> world
    const wx = (sx - computedView.offsetX) / computedView.scale;
    const wy = (sy - computedView.offsetY) / computedView.scale;

    const nextScale = clamp(computedView.scale * factor, MIN_SCALE, MAX_SCALE);

    setLocalView({
      scale: nextScale,
      offsetX: sx - wx * nextScale,
      offsetY: sy - wy * nextScale,
    });
  };

  const baseContainView = useMemo(() => {
    if (!baseImg || viewport.width === 0 || viewport.height === 0) return null;
    return calcContainView(baseImg.width, baseImg.height, viewport.width, viewport.height);
  }, [baseImg, viewport.width, viewport.height]);

  const zoomPercent = useMemo(() => {
    if (!computedView || !baseContainView) return null;
    return Math.round(Math.min((computedView.scale / baseContainView.scale) * 100, 500));
  }, [computedView, baseContainView]);

  useEffect(() => {
    if (!baseImg || viewport.width === 0 || viewport.height === 0) return;
    setLocalView(calcContainView(baseImg.width, baseImg.height, viewport.width, viewport.height));
  }, [baseImg, viewport.width, viewport.height]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !baseImg || !computedView) return;

    const { width, height } = viewport;
    if (!width || !height) return;

    // DPR-aware canvas sizing to avoid blurry rendering.
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    // View transform: screen -> world
    ctx.translate(computedView.offsetX, computedView.offsetY);
    ctx.scale(computedView.scale, computedView.scale);

    ctx.drawImage(baseImg, 0, 0);

    for (const o of overlays) {
      const img = overlayImgs[o.src];
      if (!img) continue;
      ctx.save();
      applyWorldTransform(ctx, o.imageTransform);
      ctx.globalAlpha = o.opacity ?? 0.5;
      ctx.drawImage(img, 0, 0, baseImg.width, baseImg.height);
      ctx.restore();
    }

    polygons.forEach((p, index) => {
      if (!p.vertices || p.vertices.length < 2) return;

      ctx.save();
      applyWorldTransform(ctx, p.polygonTransform);

      ctx.beginPath();
      ctx.moveTo(p.vertices[0][0], p.vertices[0][1]);
      for (let i = 1; i < p.vertices.length; i++) {
        ctx.lineTo(p.vertices[i][0], p.vertices[i][1]);
      }
      ctx.closePath();

      const isHovered = index === hoveredIndex;

      ctx.fillStyle = isHovered ? POLYGON_HOVER_FILL : (p.fill ?? POLYGON_FILL);
      ctx.globalAlpha = 1;
      ctx.fill();

      ctx.strokeStyle = isHovered ? POLYGON_HOVER_STROKE : (p.stroke ?? POLYGON_STROKE);
      ctx.lineWidth = isHovered ? POLYGON_HOVER_STROKE_WIDTH : (p.strokeWidth ?? 2);
      ctx.stroke();

      ctx.restore();
    });

    ctx.restore();
  }, [baseImg, overlays, overlayImgs, polygons, computedView, debug, viewport, hoveredIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !onPolygonClick || !computedView) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      // Screen -> world (inverse of view transform)
      const wx = (e.clientX - rect.left - computedView.offsetX) / computedView.scale;
      const wy = (e.clientY - rect.top - computedView.offsetY) / computedView.scale;

      const hit = hitTestPolygon(ctx, polygons, wx, wy);
      if (hit !== null) onPolygonClick(hit);
    };

    canvas.addEventListener('click', handleClick);
    return () => {
      canvas.removeEventListener('click', handleClick);
    };
  }, [polygons, onPolygonClick, computedView]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !computedView) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      // Screen -> world (inverse of view transform)
      const wx = (e.clientX - rect.left - computedView.offsetX) / computedView.scale;
      const wy = (e.clientY - rect.top - computedView.offsetY) / computedView.scale;

      const hit = hitTestPolygon(ctx, polygons, wx, wy);

      setHoveredIndex(hit);
      canvas.style.cursor =
        hit !== null ? 'pointer' : dragRef.current.dragging ? 'grabbing' : 'grab';
    };

    const handleLeave = () => {
      setHoveredIndex(null);
      if (!dragRef.current.dragging) canvas.style.cursor = 'grab';
    };

    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseleave', handleLeave);

    return () => {
      canvas.removeEventListener('mousemove', handleMove);
      canvas.removeEventListener('mouseleave', handleLeave);
    };
  }, [polygons, computedView]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !baseImg || !computedView || !baseContainView) return;

    const MIN_SCALE = baseContainView.scale * 0.5;
    const MAX_SCALE = baseContainView.scale * 5;

    const getWorldFromClient = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      const wx = (sx - computedView.offsetX) / computedView.scale;
      const wy = (sy - computedView.offsetY) / computedView.scale;
      return { sx, sy, wx, wy };
    };

    const handleWheel = (e: WheelEvent) => {
      // passive:false so we can prevent page scroll while zooming.
      e.preventDefault();

      const zoomIntensity = 0.0015;
      const factor = Math.exp(-e.deltaY * zoomIntensity);

      const { sx, sy, wx, wy } = getWorldFromClient(e.clientX, e.clientY);

      setLocalView((prev) => {
        const cur =
          prev ?? calcContainView(baseImg.width, baseImg.height, viewport.width, viewport.height);
        const nextScale = clamp(cur.scale * factor, MIN_SCALE, MAX_SCALE);

        // Zoom around cursor (keep world point under the mouse).
        return {
          scale: nextScale,
          offsetX: sx - wx * nextScale,
          offsetY: sy - wy * nextScale,
        };
      });
    };

    const onPointerDown = (e: PointerEvent) => {
      dragRef.current.dragging = true;
      dragRef.current.pointerId = e.pointerId;
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
      dragRef.current.startOffsetX = computedView.offsetX;
      dragRef.current.startOffsetY = computedView.offsetY;

      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragRef.current.dragging) return;
      if (dragRef.current.pointerId !== e.pointerId) return;

      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      setLocalView((prev) => {
        const cur =
          prev ?? calcContainView(baseImg.width, baseImg.height, viewport.width, viewport.height);
        return {
          ...cur,
          offsetX: dragRef.current.startOffsetX + dx,
          offsetY: dragRef.current.startOffsetY + dy,
        };
      });
    };

    const endDrag = (e: PointerEvent) => {
      if (!dragRef.current.dragging) return;
      if (dragRef.current.pointerId !== e.pointerId) return;

      dragRef.current.dragging = false;
      dragRef.current.pointerId = null;

      canvas.style.cursor = hoveredIndex !== null ? 'pointer' : 'grab';
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {
        // no-op
      }
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);

    return () => {
      canvas.removeEventListener('wheel', handleWheel as any);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', endDrag);
      canvas.removeEventListener('pointercancel', endDrag);
    };
  }, [baseImg, viewport.width, viewport.height, computedView, hoveredIndex, baseContainView]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div className={styles.controls}>
        <div className={styles.zoomRow}>
          <button
            type="button"
            className={styles.zoomButton}
            title="Zoom out"
            onClick={() => zoomBy(1 / ZOOM_STEP)}
          >
            <ZoomOut size={16} />
          </button>

          <div className={styles.zoomPercent} title="Zoom level (relative to fit-to-screen)">
            {zoomPercent}%
          </div>

          <button
            type="button"
            className={styles.zoomButton}
            title="Zoom in"
            onClick={() => zoomBy(ZOOM_STEP)}
          >
            <ZoomIn size={16} />
          </button>
        </div>

        <div className={styles.resetRow}>
          <button
            type="button"
            className={styles.resetButton}
            title="Reset view"
            onClick={resetView}
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          touchAction: 'none',
          cursor: 'grab',
        }}
      />
    </div>
  );
};
