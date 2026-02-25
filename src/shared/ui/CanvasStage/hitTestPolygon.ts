import type { StagePolygon } from './types';
import type { Transform } from '../../types/metadata';

const applyWorldTransform = (ctx: CanvasRenderingContext2D, t?: Transform) => {
  if (!t) return;
  ctx.translate(t.x, t.y);
  ctx.rotate(t.rotation);
  ctx.scale(t.scale, t.scale);
  ctx.translate(-t.x, -t.y);
};

export const hitTestPolygon = (
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
