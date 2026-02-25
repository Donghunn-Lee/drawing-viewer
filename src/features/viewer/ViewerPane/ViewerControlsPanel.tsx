import clsx from 'clsx';
import styles from './ViewerPane.module.css';

type Props = {
  children: React.ReactNode;
  layout: 'top' | 'side';
  open: boolean;
  side: 'left' | 'right';
};

export const ViewerControlsPanel = ({ children, layout, open, side }: Props) => {
  if (layout === 'top') {
    return open ? <div className={styles.controlsTop}>{children}</div> : null;
  }

  return (
    <div className={clsx(styles.controlsSide, styles[side], !open && styles.closed)}>
      {children}
    </div>
  );
};
