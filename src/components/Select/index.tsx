import { useState, useRef } from 'react';
import { useClickOutside } from '@hooks';
import styles from './Select.module.scss';

interface Props<T> {
  title: string;
  options: T[];
  setValue: (value: any) => void;
  value: string;
  getLabel: (option: T) => string;
  getValue: (option: T) => string;
  getKey?: (option: T) => string | number;
  multiSelect?: boolean;
  tabIndex?: number;
}

export const Select = <T,>({
  title = '',
  options = [],
  setValue,
  value,
  getLabel,
  getValue,
  getKey,
  tabIndex,
}: Props<T>) => {
  const ref = useRef<HTMLSelectElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleCloseSelect = () => setIsOpen(false);
  const handleOpenSelect = () => setIsOpen(true);
  const handleClickOutside = () => setIsOpen(false);

  useClickOutside(ref, handleClickOutside);

  return (
    <label
      htmlFor={title}
      className={`${styles.dropdown} ${isOpen ? styles.open : ''}`}
    >
      <select
        ref={ref}
        id={title}
        title={title}
        className={styles.dropdown__select}
        onChange={(e) => setValue(e.target.value)}
        value={value}
        tabIndex={tabIndex}
        onClick={isOpen ? handleCloseSelect : handleOpenSelect}
      >
        {options.map((option: T) => {
          const optionLabel = getLabel(option);
          const optionValue = getValue(option);
          const optionKey = getKey?.(option) ?? optionValue;

          return (
            <option key={optionKey} value={optionValue} title={optionLabel}>
              {optionLabel}
            </option>
          );
        })}
      </select>
    </label>
  );
};
