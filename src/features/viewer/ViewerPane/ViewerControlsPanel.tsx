import styles from './ViewerPane.module.css';

type Props = {
  children: React.ReactNode;
};

export const ViewerControlsPanel = ({ children }: Props) => {
  const isLandscape = window.innerWidth / window.innerHeight > 1.2;

  return <div className={isLandscape ? styles.controlsSide : styles.controlsTop}>{children}</div>;
};
