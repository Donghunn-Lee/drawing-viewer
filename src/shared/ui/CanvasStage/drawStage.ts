import type { Transform } from '../../types/metadata';

import type { StageOverlay, StagePolygon, ViewState } from './types';

type Params = {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  viewport: { width: number; height: number };
  baseImg: HTMLImageElement;
  overlays: StageOverlay[];
  overlayImgs: Record<string, HTMLImageElement>;
  polygons: StagePolygon[];
  hoveredIndex: number | null;
  view: ViewState;
};

const POLYGON_FILL = 'rgba(56, 132, 255, 0.22)';
const POLYGON_STROKE = 'rgba(56, 132, 255, 0.85)';
const POLYGON_HOVER_FILL = 'rgba(56, 180, 255, 0.38)';
const POLYGON_HOVER_STROKE = 'rgba(120, 210, 255, 1)';
const POLYGON_HOVER_STROKE_WIDTH = 4;

const applyWorldTransform = (ctx: CanvasRenderingContext2D, t?: Transform) => {
  if (!t) return;

  ctx.translate(t.x, t.y);
  ctx.rotate(t.rotation);
  ctx.scale(t.scale, t.scale);
  ctx.translate(-t.x, -t.y);
};

export const drawStage = ({
  ctx,
  canvas,
  viewport,
  baseImg,
  overlays,
  overlayImgs,
  polygons,
  hoveredIndex,
  view,
}: Params) => {
  const { width, height } = viewport;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  ctx.save();
  ctx.translate(view.offsetX, view.offsetY);
  ctx.scale(view.scale, view.scale);

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
    ctx.fill();

    ctx.strokeStyle = isHovered ? POLYGON_HOVER_STROKE : (p.stroke ?? POLYGON_STROKE);
    ctx.lineWidth = isHovered ? POLYGON_HOVER_STROKE_WIDTH : (p.strokeWidth ?? 2);
    ctx.stroke();

    ctx.restore();
  });

  ctx.restore();
};
