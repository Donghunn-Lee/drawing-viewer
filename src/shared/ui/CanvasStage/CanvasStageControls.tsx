import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import styles from './CanvasStageControls.module.css';

type Props = {
  zoomPercent: number | null;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
};

export const CanvasStageControls = ({ zoomPercent, onZoomIn, onZoomOut, onReset }: Props) => {
  return (
    <div className={styles.controls}>
      <div className={styles.zoomRow}>
        <button type="button" className={styles.zoomButton} title="Zoom out" onClick={onZoomOut}>
          <ZoomOut size={16} />
        </button>

        <div className={styles.zoomPercent} title="Zoom level (relative to fit-to-screen)">
          {zoomPercent !== null ? `${zoomPercent}%` : '-'}
        </div>

        <button type="button" className={styles.zoomButton} title="Zoom in" onClick={onZoomIn}>
          <ZoomIn size={16} />
        </button>
      </div>

      <div className={styles.resetRow}>
        <button type="button" className={styles.resetButton} title="Reset view" onClick={onReset}>
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
};
