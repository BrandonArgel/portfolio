import { Children, cloneElement, isValidElement, ReactNode } from 'react';
import styles from './Tabs.module.scss';

interface TabsProps {
  value: string;
  setValue: (value: string) => void;
  children: ReactNode;
}

export const Tabs = ({ value, setValue, children }: TabsProps) => {
  return (
    <div className={styles.tabs__panel}>
      {Children.map(children, (child) => {
        if (isValidElement(child)) {
          return cloneElement(child, {
            isActive: child.props.value === value,
            onClick: () => setValue(child.props.value),
          });
        }
        return child;
      })}
    </div>
  );
};
