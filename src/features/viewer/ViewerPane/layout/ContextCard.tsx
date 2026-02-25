import styles from '../ViewerPane.module.css';

type Props = {
  title?: string;
  children: React.ReactNode;
};

export const ContextCard = ({ title, children }: Props) => {
  return (
    <div className={styles.contextCard}>
      {title && <div className={styles.cardTitle}>{title}</div>}
      {children}
    </div>
  );
};
