import type { ViewerContext } from '../../../../shared/types/context';
import type { Drawing } from '../../../../shared/types/metadata';
import { ContextValueCell } from '../cells/ContextValueCell';

type Props = {
  context: ViewerContext;
  drawing: Drawing | null;
  revision: {
    version: string;
    date?: string;
    description?: string;
    changes?: string[];
  } | null;
};

export const ViewerContextSection = ({ context, drawing, revision }: Props) => {
  return (
    <>
      <ContextValueCell label="도면" value={drawing?.name ?? '-'} />
      <ContextValueCell label="공종" value={context.activeDiscipline ?? '-'} />
      <ContextValueCell label="구역" value={context.activeRegion ?? '-'} />
      <ContextValueCell label="리비전" value={revision?.version ?? '-'} />
      <ContextValueCell label="날짜" value={revision?.date ?? '-'} />
      <ContextValueCell label="설명" value={revision?.description ?? '-'} />
      <ContextValueCell
        label="변경사항"
        value={
          revision?.changes && revision.changes.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {revision.changes.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          ) : (
            '-'
          )
        }
      />
    </>
  );
};
