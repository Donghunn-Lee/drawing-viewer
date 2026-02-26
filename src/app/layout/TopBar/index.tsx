import { Eye, EyeOff, SlidersHorizontal } from 'lucide-react';

import styles from './TopBar.module.css';

type Props = {
  panelOpen: boolean;
  onTogglePanel: () => void;
  onResetSelection: () => void;
};

export const TopBar = ({ panelOpen, onTogglePanel, onResetSelection }: Props) => {
  return (
    <div className={styles.topBar}>
      <div
        className={styles.left}
        onClick={onResetSelection}
        role="button"
        aria-label="Reset selection"
      >
        Drawing Viewer
      </div>

      <div className={styles.right}>
        <span
          className={styles.panelStateIndicator}
          aria-hidden
          title={panelOpen ? 'Controls visible' : 'Controls hidden'}
        >
          {panelOpen ? <Eye size={16} /> : <EyeOff size={16} />}
        </span>

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
