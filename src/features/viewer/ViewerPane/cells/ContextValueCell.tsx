import styles from '../ViewerPane.module.css';

type Props = {
  label: string;
  value?: React.ReactNode;
  emptyText?: string;
};

export const ContextValueCell = ({ label, value, emptyText = '-' }: Props) => {
  const isEmpty = value == null || value === emptyText;

  return (
    <div className={styles.contextCell} data-empty={isEmpty ? 'true' : undefined}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value ?? emptyText}</span>
    </div>
  );
};
