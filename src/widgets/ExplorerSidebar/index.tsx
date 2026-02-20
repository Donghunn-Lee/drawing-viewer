import { getDisciplinesBySite, getSiteList } from '../../entities/drawing/selectors';
import type { ViewerContext } from '../../shared/types/context';
import metadata from '../../data/metadata.json';
import { useState } from 'react';

type Props = {
  setContext: React.Dispatch<React.SetStateAction<ViewerContext>>;
};

export const ExplorerSidebar = ({ setContext }: Props) => {
  const sites = getSiteList(metadata);

  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const disciplines = selectedSite ? getDisciplinesBySite(metadata, selectedSite) : [];

  const selectDrawing = (site: ViewerContext['site'], discipline: ViewerContext['discipline']) => {
    setContext({
      site,
      discipline,
      revision: 'REV1',
    });
  };
  console.log(disciplines);
  return (
    <div style={{ width: 200, borderRight: '1px solid #ddd' }}>
      {sites.map((site) => (
        <button key={site} onClick={() => setSelectedSite(site)}>
          {site}
        </button>
      ))}

      <hr />

      {disciplines.map((discipline) => (
        <button
          key={discipline}
          onClick={() =>
            selectDrawing(
              selectedSite as ViewerContext['site'],
              discipline as ViewerContext['discipline'],
            )
          }
        >
          {discipline}
        </button>
      ))}
    </div>
  );
};
