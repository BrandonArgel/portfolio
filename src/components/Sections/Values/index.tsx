import { useContext, useEffect, useRef } from 'react';
import { LanguageContext } from '@context';
import { useShowIn } from '@hooks';
import styles from './Values.module.scss';

export const Values = () => {
  const {
    texts: { values },
  } = useContext(LanguageContext);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      useShowIn(sectionRef);
    }
  }, []);

  return (
    <section className={styles.values} id={values.id} ref={sectionRef}>
      <div className={styles.values__content}>
        <h3>{values.title}</h3>
        <p>{values.description}</p>
        <ul>
          {values.list.map((value: string) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
      </div>
    </section>
  );
};
