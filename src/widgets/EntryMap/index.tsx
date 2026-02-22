import { CanvasStage } from '../../shared/ui/CanvasStage';
import metadata from '../../data/metadata.json';
import type { ViewerContext } from '../../shared/types/context';

type Props = {
  setContext: React.Dispatch<React.SetStateAction<ViewerContext>>;
};

export const EntryMap = ({ setContext }: Props) => {
  const root = Object.values(metadata.drawings).find((d) => d.parent === null);
  if (!root) return null;

  const children = Object.values(metadata.drawings).filter(
    (d) => d.parent === root.id && d.position,
  );

  return (
    <CanvasStage
      width={900}
      height={600}
      baseSrc={`/drawings/${root.image}`}
      polygons={children.map((child) => ({
        vertices: child.position!.vertices,
        stroke: 'rgba(0, 120, 255, 0.8)',
        fill: 'rgba(0, 120, 255, 0.5)',
        strokeWidth: 2,
      }))}
      onPolygonClick={(i) => {
        setContext((prev) => ({ ...prev, activeDrawingId: children[i].id }));
      }}
    />
  );
};
