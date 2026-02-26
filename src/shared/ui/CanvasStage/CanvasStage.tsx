import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { drawStage } from './drawStage';
import { useCanvasView } from './useCanvasView';
import { useCanvasInteractions } from './useCanvasInteractions';
import type { StageOverlay, StagePolygon, ViewState } from './types';
import { CanvasStageControls } from './CanvasStageControls';

type Props = {
  baseSrc: string;
  overlays?: StageOverlay[];
  polygons?: StagePolygon[];
  onPolygonClick?: (index: number) => void;
};

const ZOOM_STEP = 1.2;

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
};

const worldToScreen = (wx: number, wy: number, view: ViewState) => ({
  x: wx * view.scale + view.offsetX,
  y: wy * view.scale + view.offsetY,
});

export const CanvasStage = ({ baseSrc, overlays = [], polygons = [], onPolygonClick }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [baseImg, setBaseImg] = useState<HTMLImageElement | null>(null);
  const [overlayImgs, setOverlayImgs] = useState<Record<string, HTMLImageElement>>({});
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoverPoint, setHoverPoint] = useState<{ wx: number; wy: number } | null>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([e]) => {
      setViewport({
        width: Math.floor(e.contentRect.width),
        height: Math.floor(e.contentRect.height),
      });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    loadImage(baseSrc).then(setBaseImg);
  }, [baseSrc]);

  useEffect(() => {
    overlays.forEach((o) => {
      if (overlayImgs[o.src]) return;
      loadImage(o.src).then((img) => setOverlayImgs((p) => ({ ...p, [o.src]: img })));
    });
  }, [overlays]);

  const { view, zoomBy, resetView, zoomPercent, setLocalView, baseContainView } = useCanvasView({
    baseImg,
    viewport,
  });

  useCanvasInteractions({
    canvasRef,
    view,
    setView: setLocalView,
    baseContainView,
    baseImg,
    viewport,
    polygons,
    onPolygonClick,
    setHoveredIndex,
    setHoverPoint,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !baseImg || !view) return;

    drawStage({
      ctx,
      canvas,
      viewport,
      baseImg,
      overlays,
      overlayImgs,
      polygons,
      hoveredIndex,
      view,
    });
  }, [baseImg, overlays, overlayImgs, polygons, hoveredIndex, view, viewport]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <CanvasStageControls
        zoomPercent={zoomPercent}
        onZoomIn={() => zoomBy(ZOOM_STEP)}
        onZoomOut={() => zoomBy(1 / ZOOM_STEP)}
        onReset={resetView}
      />
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', cursor: 'grab' }} />
      {hoveredIndex !== null && hoverPoint && view && (
        <div
          style={{
            position: 'absolute',
            left: worldToScreen(hoverPoint.wx, hoverPoint.wy, view).x + 8,
            top: worldToScreen(hoverPoint.wx, hoverPoint.wy, view).y + 8,
            background: 'rgba(0,0,0,0.75)',
            color: '#fff',
            padding: '4px 8px',
            fontSize: 12,
            borderRadius: 4,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            zIndex: 20,
          }}
        >
          {polygons[hoveredIndex]?.name}
        </div>
      )}
    </div>
  );
};
