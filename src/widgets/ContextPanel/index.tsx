import type { ViewerContext } from '../../shared/types/context';
import metadataJson from '../../data/metadata.json';
import type { Metadata } from '../../shared/types/metadata';

const metadata = metadataJson as unknown as Metadata;

type Props = {
  context: ViewerContext;
};

export const ContextPanel = ({ context }: Props) => {
  const id = context.activeDrawingId;
  if (!id) {
    return (
      <div style={{ width: 250, borderLeft: '1px solid #ddd', padding: 12 }}>선택된 도면 없음</div>
    );
  }

  const drawing = metadata.drawings[id];
  if (!drawing) return null;

  return (
    <div>
      <div>도면: {drawing?.name}</div>
      <div>공종: {context.activeDiscipline ?? '전체'}</div>
      <div>리비전: {context.activeRevision ?? 'latest'}</div>
    </div>
  );
};
