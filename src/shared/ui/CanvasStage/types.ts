import type { Polygon as MetaPolygon, Transform } from '../../types/metadata';

export type StageOverlay = {
  src: string;
  imageTransform?: Transform;
  opacity?: number;
};

export type StagePolygon = MetaPolygon & {
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
};

export type ViewState = {
  scale: number;
  offsetX: number;
  offsetY: number;
};
