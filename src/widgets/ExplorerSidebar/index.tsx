import { getSiteList } from '../../entities/drawing/selectors';
import type { ViewerContext } from '../../shared/types/context';
import metadata from '../../data/metadata.json';

type Props = {
  setContext: React.Dispatch<React.SetStateAction<ViewerContext>>;
};

export const ExplorerSidebar = ({ setContext }: Props) => {
  const sites = getSiteList(metadata);

  const selectDrawing = (site: ViewerContext['site'], discipline: ViewerContext['discipline']) => {
    setContext({
      site,
      discipline,
      revision: 'REV1',
    });
  };
  console.log(sites);
  return (
    <div style={{ width: 200, borderRight: '1px solid #ddd' }}>
      {sites.map((site) => (
        <button key={site} onClick={() => selectDrawing(site as ViewerContext['site'], '건축')}>
          {site}
        </button>
      ))}
    </div>
  );
};
