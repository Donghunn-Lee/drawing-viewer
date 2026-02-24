import type { ViewerContext } from '../../shared/types/context';
import { ExplorerSidebar } from '../../features/navigation/ExplorerSidebar';
import { ViewerPane } from '../../features/viewer/ViewerPane';
import { ContextPanel } from '../../features/viewer/ContextPanel';
import { TopBar } from './TopBar';

import styles from '../layout/MainLayout.module.css';
import { useState } from 'react';

type Props = {
  context: ViewerContext;
  setContext: React.Dispatch<React.SetStateAction<ViewerContext>>;
};

export function MainLayout({ context, setContext }: Props) {
  const [showContext, setShowContext] = useState(false);

  return (
    <div className={styles.layoutRoot}>
      <TopBar context={context} onToggleContext={() => setShowContext((v) => !v)} />

      <div className={styles.mainRow}>
        <aside className={styles.sidebar}>
          <ExplorerSidebar setContext={setContext} activeDrawingId={context.activeDrawingId} />
        </aside>

        <main className={styles.viewer}>
          <ViewerPane context={context} setContext={setContext} />
        </main>

        <aside className={`${styles.context} ${showContext ? styles.contextVisible : ''}`}>
          <ContextPanel context={context} />
        </aside>
      </div>
    </div>
  );
}
