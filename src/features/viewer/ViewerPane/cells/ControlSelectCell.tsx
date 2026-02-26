import type { SelectOption } from '../hooks/useViewerDerivedState';
import styles from '../ViewerPane.module.css';

type Props =
  | {
      isEmpty: true;
      label?: string;
    }
  | {
      isEmpty?: false;
      label: string;
      value: string | null;
      options: SelectOption[];
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
    <div className={styles.controlCell} data-disabled={disabled ? 'true' : undefined}>
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
            {o.isLatest ? ' (최신)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
};
