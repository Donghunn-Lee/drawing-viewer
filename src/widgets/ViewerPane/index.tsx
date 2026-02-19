import type { ViewerContext } from '../../shared/types/context';

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

function getImageSrc(context: ViewerContext) {
  if (context.site === '101동' && context.discipline === '건축') {
    return '/drawings/01_101동 지상1층 평면도_건축.png';
  }
  if (context.site === '101동' && context.discipline === '설비') {
    return '/drawings/07_101동 지상1층 평면도_배관설비.jpeg';
  }
  return '/drawings/14_주차장 지상1층 확대 평면도_소방.jpeg';
}
