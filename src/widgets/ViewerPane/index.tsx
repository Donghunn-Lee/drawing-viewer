import type { ViewerContext } from '../../shared/types/context';
import { getImageSrc } from '../../shared/utils/gameImageSrc';

type Props = {
  context: ViewerContext;
};

export default function ViewerPane({ context }: Props) {
  const src = getImageSrc(context);

  return (
    <div style={{ flex: 1, background: '#f5f5f5' }}>
      <img src={src} style={{ width: '100%' }} />
    </div>
  );
}
