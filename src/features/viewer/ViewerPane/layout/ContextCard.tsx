import styles from '../ViewerPane.module.css';

export const ContextCard = ({ children }: { children: React.ReactNode }) => {
  return <div className={styles.contextCard}>{children}</div>;
};
