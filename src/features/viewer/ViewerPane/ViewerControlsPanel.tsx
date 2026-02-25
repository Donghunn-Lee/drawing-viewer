import clsx from 'clsx';
import styles from './ViewerPane.module.css';

type Props = {
  children: React.ReactNode;
  layout: 'top' | 'side';
  open: boolean;
  side: 'left' | 'right';
};

export const ViewerControlsPanel = ({ children, layout, open, side }: Props) => {
  if (!open) return null;

  if (layout === 'top') {
    return <div className={styles.controlsTop}>{children}</div>;
  }

  return (
    <div className={clsx(styles.controlsSide, side === 'left' ? styles.left : styles.right)}>
      {children}
    </div>
  );
};
