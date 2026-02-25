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
  const [showContext, setShowContext] = useState(false);

  return (
    <div className={styles.layoutRoot}>
      <TopBar context={context} onToggleContext={() => setShowContext((v) => !v)} />

      <div className={styles.mainRow}>
        <main className={styles.viewer}>
          <ViewerPane context={context} setContext={setContext} />
        </main>
      </div>
    </div>
  );
}
