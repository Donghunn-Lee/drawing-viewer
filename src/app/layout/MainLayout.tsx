import { useEffect, useState } from 'react';

import type { ViewerContext } from '../../shared/types/context';
import type { ViewerLayout } from '../../shared/types/viewerLayout';

import { ViewerPane } from '../../features/viewer/ViewerPane/ViewerPane';
import { TopBar } from './TopBar';

import styles from '../layout/MainLayout.module.css';

type Props = {
  context: ViewerContext;
  setContext: React.Dispatch<React.SetStateAction<ViewerContext>>;
};

export function MainLayout({ context, setContext }: Props) {
  const getInitialLayout = (): ViewerLayout =>
    window.innerWidth / window.innerHeight > 1
      ? { mode: 'side', side: 'left', open: true }
      : { mode: 'top', open: true };

  const [viewerLayout, setViewerLayout] = useState<ViewerLayout>(getInitialLayout);

  const onResetSelection = () => {
    setContext({
      activeDrawingId: null,
      activeDiscipline: null,
      activeRegion: null,
      activeRevision: null,
      overlay: {
        enabled: false,
        targets: [],
        opacity: 0.5,
      },
    });
  };

  const togglePanel = () => {
    setViewerLayout((prev) => ({ ...prev, open: !prev.open }));
  };

  useEffect(() => {
    const onResize = () => {
      const isLandscape = window.innerWidth / window.innerHeight > 1;

      setViewerLayout((prev) => {
        if (isLandscape) {
          return prev.mode === 'side' ? prev : { mode: 'side', side: 'left', open: prev.open };
        }

        return prev.mode === 'top' ? prev : { mode: 'top', open: prev.open };
      });
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className={styles.layoutRoot}>
      <TopBar
        panelOpen={viewerLayout.open}
        onTogglePanel={togglePanel}
        onResetSelection={onResetSelection}
      />

      <div className={styles.mainRow}>
        <main className={styles.viewer}>
          <ViewerPane
            context={context}
            setContext={setContext}
            viewerLayout={viewerLayout}
            setViewerLayout={setViewerLayout}
          />
        </main>
      </div>
    </div>
  );
}
