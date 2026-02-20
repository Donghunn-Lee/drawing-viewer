import { getSiteList } from '../../entities/drawing/selectors';
import type { ViewerContext } from '../../shared/types/context';
import metadata from '../../data/metadata.json';

type Props = {
  setContext: React.Dispatch<React.SetStateAction<ViewerContext>>;
};

export const ExplorerSidebar = ({ setContext }: Props) => {
  const sites = getSiteList(metadata);

  const selectDrawing = (drawingId: string) => {
    setContext({ activeDrawingId: drawingId });
  };

  return (
    <div style={{ width: 200, borderRight: '1px solid #ddd' }}>
      {sites.map((site) => (
        <button key={site.id} onClick={() => selectDrawing(site.id)}>
          {site.name}
        </button>
      ))}
    </div>
  );
};
