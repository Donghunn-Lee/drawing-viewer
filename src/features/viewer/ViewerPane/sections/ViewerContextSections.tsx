import type { ViewerContext } from '../../../../shared/types/context';
import { ContextValueCell } from '../cells/ContextValueCell';

type Props = {
  context: ViewerContext;
  revision: {
    version: string;
    date?: string;
    description?: string;
    changes?: string[];
  } | null;
};

export const ViewerContextSection = ({ context, revision }: Props) => {
  return (
    <>
      <ContextValueCell label="공종" value={context.activeDiscipline ?? '전체'} />
      <ContextValueCell label="구역" value={context.activeRegion ?? '전체'} />
      <ContextValueCell label="리비전" value={revision?.version ?? '최신'} />
      <ContextValueCell label="날짜" value={revision?.date ?? '-'} />
      <ContextValueCell label="설명" value={revision?.description ?? '-'} />
      <ContextValueCell
        label="변경사항"
        value={revision?.changes && revision.changes.length > 0 ? revision.changes.join(', ') : '-'}
      />
    </>
  );
};
