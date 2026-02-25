import styles from '../ViewerPane.module.css';

type Props = {
  label: string;
  value?: React.ReactNode;
  emptyText?: string;
};

export const ContextValueCell = ({ label, value, emptyText = '-' }: Props) => {
  return (
    <div className={styles.contextCell}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value ?? emptyText}</span>
    </div>
  );
};
