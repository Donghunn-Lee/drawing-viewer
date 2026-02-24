import styles from './ViewerPane.module.css';

type Props = {
  layout: 'top' | 'side';
  children: React.ReactNode;
};

export const ViewerContextSurface = ({ layout, children }: Props) => {
  return (
    <div className={layout === 'top' ? styles.surfaceTop : styles.surfaceSide}>{children}</div>
  );
};
