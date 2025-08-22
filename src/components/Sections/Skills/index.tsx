import { useContext, useEffect, useRef } from 'react';
import { LanguageContext } from '@context';
import { useShowIn } from '@hooks';
import styles from './Skills.module.scss';

export const Skills = () => {
  const {
    texts: { skills },
  } = useContext(LanguageContext);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      useShowIn(sectionRef);
    }
  }, []);

  return (
    <section className={styles.skills} id={skills.id} ref={sectionRef}>
      <div className={styles.skills__content}>
        <h3>{skills.title}</h3>
        <ul>
          {skills.list.map((skill: string) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      </div>
    </section>
  );
};
