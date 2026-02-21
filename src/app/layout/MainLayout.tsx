import type { ViewerContext } from '../../shared/types/context';
import { ExplorerSidebar } from '../../widgets/ExplorerSidebar';
import { ViewerPane } from '../../widgets/ViewerPane';
import { ContextPanel } from '../../widgets/ContextPanel';

type Props = {
  context: ViewerContext;
  setContext: React.Dispatch<React.SetStateAction<ViewerContext>>;
};

export function MainLayout({ context, setContext }: Props) {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <ExplorerSidebar setContext={setContext} activeDrawingId={context.activeDrawingId} />
      <ViewerPane context={context} setContext={setContext} />
      <ContextPanel context={context} />
    </div>
  );
}
