import { useEffect, useMemo, useState } from 'react';
import type { ViewState } from './types';

type Params = {
  baseImg: HTMLImageElement | null;
  viewport: { width: number; height: number };
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const calcContainView = (
  baseW: number,
  baseH: number,
  viewportW: number,
  viewportH: number,
): ViewState => {
  const scale = Math.min(viewportW / baseW, viewportH / baseH);
  return {
    scale,
    offsetX: (viewportW - baseW * scale) / 2,
    offsetY: (viewportH - baseH * scale) / 2,
  };
};

export const useCanvasView = ({ baseImg, viewport }: Params) => {
  const [localView, setLocalView] = useState<ViewState | null>(null);

  const baseContainView = useMemo(() => {
    if (!baseImg || !viewport.width || !viewport.height) return null;
    return calcContainView(baseImg.width, baseImg.height, viewport.width, viewport.height);
  }, [baseImg, viewport]);

  const computedView = useMemo(() => {
    if (!baseContainView) return null;
    return localView ?? baseContainView;
  }, [localView, baseContainView]);

  const zoomBy = (factor: number) => {
    if (!computedView || !baseContainView) return;

    const MIN = baseContainView.scale * 0.5;
    const MAX = baseContainView.scale * 5;

    const sx = viewport.width / 2;
    const sy = viewport.height / 2;

    const wx = (sx - computedView.offsetX) / computedView.scale;
    const wy = (sy - computedView.offsetY) / computedView.scale;

    const nextScale = clamp(computedView.scale * factor, MIN, MAX);

    setLocalView({
      scale: nextScale,
      offsetX: sx - wx * nextScale,
      offsetY: sy - wy * nextScale,
    });
  };

  const resetView = () => {
    if (!baseContainView) return;
    setLocalView(baseContainView);
  };

  const zoomPercent = useMemo(() => {
    if (!computedView || !baseContainView) return null;
    return Math.round((computedView.scale / baseContainView.scale) * 100);
  }, [computedView, baseContainView]);

  useEffect(() => {
    if (!baseContainView) return;
    setLocalView(baseContainView);
  }, [baseContainView]);

  return {
    view: computedView,
    zoomBy,
    resetView,
    zoomPercent,
    setLocalView,
    baseContainView,
  };
};
