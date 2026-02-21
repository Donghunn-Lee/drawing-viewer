import type { ViewerContext } from '../../shared/types/context';
import { ExplorerSidebar } from '../../widgets/ExplorerSidebar';
import { ViewerPane } from '../../widgets/ViewerPane';
import { ContextPanel } from '../../widgets/ContextPanel';

import styles from '../layout/MainLayout.module.css';

type Props = {
  context: ViewerContext;
  setContext: React.Dispatch<React.SetStateAction<ViewerContext>>;
};

export function MainLayout({ context, setContext }: Props) {
  return (
    <div className={styles.mainLayout}>
      <aside className={styles.sidebar}>
        <ExplorerSidebar setContext={setContext} activeDrawingId={context.activeDrawingId} />
      </aside>

      <main className={styles.viewer}>
        <ViewerPane context={context} setContext={setContext} />
      </main>

      <aside className={styles.context}>
        <ContextPanel context={context} />
      </aside>
    </div>
  );
}
