import styles from '../ViewerPane.module.css';

type Props = {
  label: string;
  checked: boolean;
  disabled?: boolean;
  description?: string;
  onChange: (checked: boolean) => void;
};

export const ControlCheckboxCell = ({ label, checked, disabled, description, onChange }: Props) => {
  return (
    <div className={styles.controlCell} data-disabled={disabled ? 'true' : undefined}>
      <span className={styles.label}>{label}</span>

      <div style={{ display: 'flex', gap: '4px' }}>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={disabled ? false : checked}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span />
        </label>

        {description && (
          <span
            style={{
              fontSize: 11,
              color: disabled ? '#666' : '#999',
              marginTop: 2,
            }}
          >
            {description}
          </span>
        )}
      </div>
    </div>
  );
};
