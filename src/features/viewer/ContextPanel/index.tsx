import type { ViewerContext } from '../../shared/types/context';
import metadataJson from '../../data/metadata.json';
import type { Metadata } from '../../shared/types/metadata';
import { resolveRevisionContext } from '../../entities/drawing/selectors';

import styles from './ContextPanel.module.css';

const metadata = metadataJson as unknown as Metadata;

type Props = {
  context: ViewerContext;
};

export const ContextPanel = ({ context }: Props) => {
  const resolved = resolveRevisionContext(metadata, context);

  if (resolved.kind === 'empty') {
    return <div className={styles.panel}>{resolved.message}</div>;
  }

  const { drawingName, disciplineName, regionName, selectedRevision, latestRevision, message } =
    resolved;

  return (
    <div className={styles.panel}>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Context</div>
        <div className={styles.row}>
          <div className={styles.label}>도면</div>
          <div className={styles.value}>{drawingName}</div>
        </div>
        <div className={styles.row}>
          <div className={styles.label}>공종</div>
          <div className={styles.value}>{disciplineName ?? '전체'}</div>
        </div>
        {regionName && (
          <div className={styles.row}>
            <div className={styles.label}>Region</div>
            <div className={styles.value}>{regionName}</div>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Revision</div>

        {message && <div className={styles.empty}>{message}</div>}

        {selectedRevision && (
          <>
            <div className={styles.row}>
              <div className={styles.label}>선택</div>
              <div className={styles.value}>{selectedRevision.version}</div>
            </div>
            <div className={styles.row}>
              <div className={styles.label}>날짜</div>
              <div className={styles.value}>{selectedRevision.date}</div>
            </div>
            <div className={styles.row}>
              <div className={styles.label}>설명</div>
              <div className={styles.value}>{selectedRevision.description}</div>
            </div>

            {selectedRevision.changes.length > 0 && (
              <ul className={styles.changes}>
                {selectedRevision.changes.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            )}
          </>
        )}

        {latestRevision && (
          <div className={styles.row} style={{ marginTop: 8 }}>
            <div className={styles.label}>Latest</div>
            <div className={styles.value}>
              {latestRevision.version} ({latestRevision.date})
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
