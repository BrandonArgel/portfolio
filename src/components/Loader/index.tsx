import { Spinner } from '@assets/icons';

import styles from './Loader.module.scss';

export const Loader = () => {
  return (
    <div className={styles.loader}>
      <Spinner />
    </div>
  );
};
