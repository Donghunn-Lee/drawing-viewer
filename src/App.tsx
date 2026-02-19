import { useState } from 'react';
import type { ViewerContext } from './shared/types/context';
import { MainLayout } from './app/layout/MainLayout';

export default function App() {
  const [context, setContext] = useState<ViewerContext>({
    site: '101동',
    discipline: '건축',
    revision: 'REV1',
  });
  return <MainLayout context={context} setContext={setContext} />;
}
