import { useContext, useEffect, useRef } from 'react';
import { LanguageContext } from '@context';
import { useShowIn } from '@hooks';
import styles from './SoftSkills.module.scss';

export const SoftSkills = () => {
  const {
    texts: { softSkills },
  } = useContext(LanguageContext);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      useShowIn(sectionRef);
    }
  }, []);

  return (
    <section className={styles.softSkills} id={softSkills.id} ref={sectionRef}>
      <div className={styles.softSkills__content}>
        <h3>{softSkills.title}</h3>
        <p>{softSkills.description}</p>
        <ul>
          {softSkills.list.map((softSkill: string) => (
            <li key={softSkill}>{softSkill}</li>
          ))}
        </ul>
      </div>
    </section>
  );
};
