import type { ViewerContext } from '../../../../shared/types/context';
import type { Drawing } from '../../../../shared/types/metadata';

import { ContextValueCell } from '../cells/ContextValueCell';

import styles from '../ViewerPane.module.css';

type Props = {
  context: ViewerContext;
  drawing: Drawing | null;
  revision: {
    version: string;
    date?: string;
    description?: string;
    changes?: string[];
  } | null;
  isLatest: boolean;
};

export const ViewerContextSection = ({ context, drawing, revision, isLatest }: Props) => {
  const isRoot = drawing?.parent === null;
  const isBase =
    !isRoot && !context.activeDiscipline && !context.activeRegion && !context.activeRevision;

  return (
    <>
      <ContextValueCell
        label="도면"
        value={
          drawing ? (
            <>
              <span>{drawing.name}</span>
              {isRoot && <span className={styles.rootBadge}>(최상위 도면)</span>}
              {isBase && <span className={styles.baseBadge}>(기준 도면)</span>}
            </>
          ) : (
            '-'
          )
        }
      />

      <ContextValueCell label="공종" value={context.activeDiscipline ?? '-'} />
      <ContextValueCell label="구역" value={context.activeRegion ?? '-'} />

      <ContextValueCell
        label="리비전"
        value={
          revision ? (
            <>
              {revision.version}
              {isLatest && <span className={styles.latestBadge}>(최신)</span>}
            </>
          ) : (
            '-'
          )
        }
      />

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
