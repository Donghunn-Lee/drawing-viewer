import type { ViewerContext } from '../../shared/types/context';
import type { Metadata } from '../../shared/types/metadata';

import metadataJson from '../../data/metadata.json';
import { getSiteList } from '../../entities/drawing/selectors';

const metadata = metadataJson as Metadata;

type Props = {
  context: ViewerContext;
};

console.log(metadata.project);
console.log(Object.keys(metadata.drawings));
console.log(getSiteList(metadata));

export const ViewerPane = ({ context }: Props) => {
  const id = context.activeDrawingId;
  if (!id) return null;

  const drawing = metadata.drawings[id];
  if (!drawing) return null;

  console.log(drawing);

  return (
    <div style={{ flex: 1, background: '#f5f5f5' }}>
      <img src={`/drawings/${drawing.image}`} style={{ width: '100%' }} />
    </div>
  );
};
