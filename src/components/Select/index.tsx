import styles from "./Select.module.scss";
import { Languages } from "@context";
interface SelectOption {
  name: string;
  language: string;
}

interface Props {
  title: string;
  options: SelectOption[];
  setValue: (lang: Languages) => void;
  value: string;
  multiSelect?: boolean;
  tabIndex?: number;
}

const Select = ({
  title = "",
  options = [],
  setValue,
  value,
  tabIndex,
}: Props) => {
  return (
    <label htmlFor={title} className={styles.dropdown}>
      <select
        id={title}
        title={title}
        className={styles.dropdown__select}
        onChange={(e) => setValue(e.target.value as Languages)}
        value={value}
        tabIndex={tabIndex}
      >
        {options.map(({ name, language }) => (
          <option key={name} value={language} title={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
};

export { Select };
