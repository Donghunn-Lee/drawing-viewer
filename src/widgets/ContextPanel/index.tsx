import type { ViewerContext } from '../../shared/types/context';

type Props = {
  context: ViewerContext;
};

export const ContextPanel = ({ context }: Props) => {
  return (
    <div style={{ width: 250, borderLeft: '1px solid #ddd', padding: 12 }}>
      {context.activeDrawingId}
    </div>
  );
};
