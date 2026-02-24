import { CanvasStage } from '../../../shared/ui/CanvasStage';
import type { Polygon, Transform } from '../../../shared/types/metadata';

type Props = {
  baseSrc: string;
  polygons: Polygon[];
  overlays?: {
    src: string;
    imageTransform?: Transform;
    opacity?: number;
  }[];
  onPolygonClick?: (index: number) => void;
};

export const DrawingCanvas = ({ baseSrc, polygons, overlays, onPolygonClick }: Props) => {
  return (
    <CanvasStage
      baseSrc={baseSrc}
      overlays={overlays}
      polygons={polygons}
      onPolygonClick={onPolygonClick}
    />
  );
};
