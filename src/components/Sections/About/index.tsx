import { useContext, useEffect, useRef } from 'react';
import { SoftSkills, Skills, Values } from '../';
import { LanguageContext } from '@context';
import { useShowIn } from '@hooks';
import { getAge } from '@utils';
import Me from '@assets/images/me.jpg';
import Me2x from '@assets/images/me-x2.jpg';
import styles from './About.module.scss';

export const About = () => {
  const {
    texts: { about },
  } = useContext(LanguageContext);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      useShowIn(sectionRef);
    }
  }, []);

  return (
    <>
      <section className={styles.about} id={about.id} ref={sectionRef}>
        <div className={styles.about__container}>
          <div className={styles.about__content}>
            <h2>{about.title}</h2>
            <p>
              {about.description.firstPart} {getAge('2002-06-27')}{' '}
              {about.description.secondPart}
            </p>
            <p>{about.description.secondParagraph}</p>
            <p>{about.description.thirdParagraph}</p>
            <p>{about.studies}</p>
            <blockquote>{about.motto}</blockquote>
            <p>{about.focus.past}</p>
            <p>{about.focus.main}</p>
          </div>
          <img
            alt={about.photo}
            className={styles.about__image}
            src={Me}
            height={400}
            loading="lazy"
            srcSet={`${Me2x} 2x`}
            title={about.photo}
            width={400}
          />
        </div>
        <SoftSkills />
        <Values />
        <Skills />
      </section>
    </>
  );
};
