import type { ViewerContext } from '../../../shared/types/context';
import metadataJson from '../../../data/metadata.json';
import type { Metadata } from '../../../shared/types/metadata';
import { resolveRevisionContext } from '../../../entities/drawing/selectors';

import styles from './TopBar.module.css';

const metadata = metadataJson as unknown as Metadata;

type Props = {
  context: ViewerContext;
  onTogglePanel: () => void;
  onToggleSide?: () => void;
  isSideLayout?: boolean;
};

export const TopBar = ({ context, onTogglePanel, onToggleSide, isSideLayout }: Props) => {
  const resolved = resolveRevisionContext(metadata, context);

  return (
    <div className={styles.topBar}>
      <div className={styles.left}>
        {resolved.kind === 'ok' ? resolved.drawingName : 'No drawing'}
      </div>

      <div className={styles.right}>
        <button className={styles.contextButton} onClick={onTogglePanel}>
          Context
        </button>
        {isSideLayout && <button onClick={onToggleSide}>패널 위치 전환</button>}
      </div>
    </div>
  );
};
