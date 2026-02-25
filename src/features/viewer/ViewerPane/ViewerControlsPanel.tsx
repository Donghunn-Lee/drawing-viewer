import clsx from 'clsx';
import styles from './ViewerPane.module.css';

type Props = {
  children: React.ReactNode;
  layout: 'top' | 'side';
};

export const ViewerControlsPanel = ({ children, layout }: Props) => {
  return (
    <div className={clsx(layout === 'top' ? styles.controlsTop : styles.controlsSide)}>
      {children}
    </div>
  );
};
