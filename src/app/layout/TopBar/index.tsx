import type { ViewerContext } from '../../../shared/types/context';
import metadataJson from '../../../data/metadata.json';
import type { Metadata } from '../../../shared/types/metadata';
import { resolveRevisionContext } from '../../../entities/drawing/selectors';

import styles from './TopBar.module.css';
import { Eye, EyeOff, SlidersHorizontal } from 'lucide-react';

const metadata = metadataJson as unknown as Metadata;

type Props = {
  context: ViewerContext;
  panelOpen: boolean;
  onTogglePanel: () => void;
};

export const TopBar = ({ context, panelOpen, onTogglePanel }: Props) => {
  const resolved = resolveRevisionContext(metadata, context);

  return (
    <div className={styles.topBar}>
      <div className={styles.left}>
        {resolved.kind === 'ok' ? resolved.drawingName : 'No drawing'}
      </div>

      <div className={styles.right}>
        {/* 상태 표시용 아이콘 (비클릭) */}
        <span
          className={styles.panelStateIndicator}
          aria-hidden
          title={panelOpen ? 'Controls visible' : 'Controls hidden'}
        >
          {panelOpen ? <Eye size={16} /> : <EyeOff size={16} />}
        </span>

        {/* 실제 액션 버튼 */}
        <button
          onClick={onTogglePanel}
          className={styles.controlButton}
          aria-pressed={panelOpen}
          aria-label={panelOpen ? 'Hide controls' : 'Show controls'}
        >
          <SlidersHorizontal size={16} />
          <span>Control</span>
        </button>
      </div>
    </div>
  );
};
