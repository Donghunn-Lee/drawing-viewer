import styles from './ViewerPane.module.css';

type Props = {
  children: React.ReactNode;
  layout: 'top' | 'side';
  open: boolean;
};

export const ViewerControlsPanel = ({ children, layout, open }: Props) => {
  if (!open) return null;

  return (
    <div className={layout === 'side' ? styles.controlsSide : styles.controlsTop}>{children}</div>
  );
};
