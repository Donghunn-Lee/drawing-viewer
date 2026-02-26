import styles from '../ViewerPane.module.css';

type Props = {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

export const ControlCheckboxCell = ({ label, checked, disabled, onChange }: Props) => {
  return (
    <div className={styles.controlCell} data-disabled={disabled ? 'true' : undefined}>
      <span className={styles.label}>{label}</span>

      <label className={styles.checkbox}>
        <input
          type="checkbox"
          checked={disabled ? false : checked}
          disabled={disabled}
          onChange={(e) => {
            if (disabled) return;
            onChange(e.target.checked);
          }}
        />
        <span />
      </label>
    </div>
  );
};
