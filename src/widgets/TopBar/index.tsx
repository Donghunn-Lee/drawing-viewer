import type { ViewerContext } from '../../shared/types/context';
import metadataJson from '../../data/metadata.json';
import type { Metadata } from '../../shared/types/metadata';
import { resolveRevisionContext } from '../../entities/drawing/selectors';

import styles from './TopBar.module.css';

const metadata = metadataJson as unknown as Metadata;

type Props = {
  context: ViewerContext;
};

export const TopBar = ({ context }: Props) => {
  const resolved = resolveRevisionContext(metadata, context);

  if (resolved.kind !== 'ok') {
    return <div className={styles.topBar}>No drawing selected</div>;
  }

  const { drawingName, disciplineName, regionName, selectedRevision, latestRevision } = resolved;

  return (
    <div className={styles.topBar}>
      <div className={styles.left}>
        <span className={styles.drawing}>{drawingName}</span>
      </div>

      <div className={styles.right}>
        {disciplineName && (
          <span className={styles.meta}>
            {disciplineName}
            {regionName ? ` / ${regionName}` : ''}
          </span>
        )}

        {selectedRevision && (
          <span className={styles.meta}>
            {selectedRevision.version}
            {latestRevision && selectedRevision.version !== latestRevision.version
              ? ` (Latest: ${latestRevision.version})`
              : ''}
          </span>
        )}
      </div>
    </div>
  );
};
