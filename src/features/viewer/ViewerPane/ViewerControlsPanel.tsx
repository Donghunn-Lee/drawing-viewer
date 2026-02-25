import type { ViewerLayout } from '../../../shared/types/viewerLayout';

import styles from './ViewerPane.module.css';
import { ArrowLeftRight } from 'lucide-react';

type Props = {
  children: React.ReactNode;
  layout: ViewerLayout;
  setViewerLayout: React.Dispatch<React.SetStateAction<ViewerLayout>>;
};

export const ViewerControlsPanel = ({ children, layout, setViewerLayout }: Props) => {
  const toggleSide = () => {
    setViewerLayout((prev) =>
      prev.mode === 'side' ? { ...prev, side: prev.side === 'left' ? 'right' : 'left' } : prev,
    );
  };

  return (
    <div className={layout.mode === 'top' ? styles.controlsTop : styles.controlsSide}>
      {layout.mode === 'side' && (
        <button
          className={styles.panelToggleButton}
          onClick={toggleSide}
          aria-label="Toggle panel position"
        >
          <ArrowLeftRight size={16} />
        </button>
      )}

      {children}
    </div>
  );
};
