import type { ViewerContext } from '../../shared/types/context';
import { getImageSrc } from '../../shared/utils/gameImageSrc';

import metadata from '../../data/metadata.json';
import { getSiteList } from '../../entities/drawing/selectors';

type Props = {
  context: ViewerContext;
};

console.log(metadata.project);
console.log(Object.keys(metadata.drawings));
console.log(getSiteList(metadata));

export const ViewerPane = ({ context }: Props) => {
  const src = getImageSrc(context);

  return (
    <div style={{ flex: 1, background: '#f5f5f5' }}>
      <img src={src} style={{ width: '100%' }} />
    </div>
  );
};
