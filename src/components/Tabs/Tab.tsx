import styles from './Tab.module.scss';

interface TabProps {
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

export const Tab = ({ label, isActive, onClick }: TabProps) => {
  return (
    <div
      className={`${styles.tab} ${isActive ? styles.active : ''}`}
      onClick={onClick}
    >
      {label}
    </div>
  );
};
