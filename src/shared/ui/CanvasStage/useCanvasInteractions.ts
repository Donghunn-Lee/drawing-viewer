import { useEffect, useRef } from 'react';
import type { StagePolygon, ViewState } from './types';
import { hitTestPolygon } from './hitTestPolygon';

type Props = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  view: ViewState | null;
  setView: (updater: (prev: ViewState | null) => ViewState) => void;
  baseContainView: ViewState | null;
  baseImg: HTMLImageElement | null;
  viewport: { width: number; height: number };
  polygons: StagePolygon[];
  onPolygonClick?: (index: number) => void;
  setHoveredIndex: (v: number | null) => void;
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export const useCanvasInteractions = ({
  canvasRef,
  view,
  setView,
  baseContainView,
  baseImg,
  polygons,
  onPolygonClick,
  setHoveredIndex,
}: Props) => {
  const dragRef = useRef({
    dragging: false,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
    pointerId: null as number | null,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !view || !baseContainView || !baseImg) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const MIN = baseContainView.scale * 0.5;
    const MAX = baseContainView.scale * 5;

    const getWorld = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      const wx = (sx - view.offsetX) / view.scale;
      const wy = (sy - view.offsetY) / view.scale;
      return { sx, sy, wx, wy };
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = Math.exp(-e.deltaY * 0.0015);
      const { sx, sy, wx, wy } = getWorld(e.clientX, e.clientY);

      setView((prev) => {
        const cur = prev!;
        const nextScale = clamp(cur.scale * factor, MIN, MAX);
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
      dragRef.current.startOffsetX = view.offsetX;
      dragRef.current.startOffsetY = view.offsetY;

      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = 'grabbing';
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragRef.current.dragging) return;
      if (dragRef.current.pointerId !== e.pointerId) return;

      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;

      setView((prev) => ({
        ...prev!,
        offsetX: dragRef.current.startOffsetX + dx,
        offsetY: dragRef.current.startOffsetY + dy,
      }));
    };

    const endDrag = (e: PointerEvent) => {
      if (dragRef.current.pointerId !== e.pointerId) return;
      dragRef.current.dragging = false;
      dragRef.current.pointerId = null;
      canvas.style.cursor = 'grab';
      try {
        canvas.releasePointerCapture(e.pointerId);
      } catch {}
    };

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const wx = (e.clientX - rect.left - view.offsetX) / view.scale;
      const wy = (e.clientY - rect.top - view.offsetY) / view.scale;
      const hit = hitTestPolygon(ctx, polygons, wx, wy);
      setHoveredIndex(hit);
      canvas.style.cursor = hit !== null ? 'pointer' : 'grab';
    };

    const onClick = (e: MouseEvent) => {
      if (!onPolygonClick) return;
      const rect = canvas.getBoundingClientRect();
      const wx = (e.clientX - rect.left - view.offsetX) / view.scale;
      const wy = (e.clientY - rect.top - view.offsetY) / view.scale;
      const hit = hitTestPolygon(ctx, polygons, wx, wy);
      if (hit !== null) onPolygonClick(hit);
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerup', endDrag);
    canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('click', onClick);

    return () => {
      canvas.removeEventListener('wheel', onWheel as any);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerup', endDrag);
      canvas.removeEventListener('pointercancel', endDrag);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('click', onClick);
    };
  }, [view, polygons, onPolygonClick]);
};
