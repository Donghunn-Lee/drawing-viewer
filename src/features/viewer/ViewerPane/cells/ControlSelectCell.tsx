import styles from '../ViewerPane.module.css';

type Option = {
  value: string;
  label: string;
};

type Props =
  | {
      isEmpty: true;
      label?: string;
    }
  | {
      isEmpty?: false;
      label: string;
      value: string | null;
      options: Option[];
      placeholder?: string;
      disabled?: boolean;
      onChange: (value: string | null) => void;
    };

export const ControlSelectCell = (props: Props) => {
  if (props.isEmpty) {
    return (
      <div className={styles.controlCell}>
        <span className={styles.label}>{props.label ?? ''}</span>
        <div style={{ height: 28 }} />
      </div>
    );
  }

  const { label, value, options, placeholder = '-', disabled, onChange } = props;

  return (
    <div className={styles.controlCell}>
      <span className={styles.label}>{label}</span>

      <select
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
};
