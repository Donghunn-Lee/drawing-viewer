import { useState } from 'react';
import type { ViewerContext } from './shared/types/context';
import { MainLayout } from './app/layout/MainLayout';

export default function App() {
  const [viewerContext, setViewerContext] = useState<ViewerContext>({
    activeDrawingId: null,
    activeDiscipline: null,
    activeRegion: null,
    activeRevision: null,
  });

  return <MainLayout context={viewerContext} setContext={setViewerContext} />;
}
