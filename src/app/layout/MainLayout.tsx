import type { ViewerContext } from '../../shared/types/context';
import { ViewerPane } from '../../features/viewer/ViewerPane/ViewerPane';
import { TopBar } from './TopBar';

import styles from '../layout/MainLayout.module.css';
import { useState } from 'react';

type Props = {
  context: ViewerContext;
  setContext: React.Dispatch<React.SetStateAction<ViewerContext>>;
};

export function MainLayout({ context, setContext }: Props) {
  const [ispanelOpen, setIsPanelOpen] = useState(true);

  return (
    <div className={styles.layoutRoot}>
      <TopBar context={context} onToggleContext={() => setIsPanelOpen((v) => !v)} />

      <div className={styles.mainRow}>
        <main className={styles.viewer}>
          <ViewerPane context={context} setContext={setContext} panelOpen={ispanelOpen} />
        </main>
      </div>
    </div>
  );
}
