import type { ViewerContext } from '../types/context';

const IMAGE_MAP = {
  전체: {},
  '101동': {
    건축: '/drawings/01_101동 지상1층 평면도_건축.png',
    설비: '/drawings/07_101동 지상1층 평면도_배관설비.jpeg',
  },
  주차장: {
    소방: '/drawings/14_주차장 지상1층 확대 평면도_소방.jpeg',
  },
} as const;

export function getImageSrc(context: ViewerContext): string {
  if (context.site === '101동') {
    return IMAGE_MAP['101동'][context.discipline as '건축' | '설비'] ?? '';
  }

  if (context.site === '주차장') {
    return IMAGE_MAP['주차장'][context.discipline as '소방'] ?? '';
  }

  return '';
}
