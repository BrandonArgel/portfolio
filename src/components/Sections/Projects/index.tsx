import { useContext, useEffect, useRef } from 'react';
import { LanguageContext } from '@context';
import { useShowIn } from '@hooks';
import { Card } from '@components';
import styles from './Projects.module.scss';

export const Projects = () => {
  const {
    texts: { projects },
  } = useContext(LanguageContext);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sectionRef.current) {
      useShowIn(sectionRef);
    }
  }, []);
  return (
    <section className={styles.projects} id={projects.id} ref={sectionRef}>
      <h2>{projects.title}</h2>
      <p>{projects.description}</p>
      <div className={styles.projects__container}>
        {projects.list.map(
          ({
            name,
            description,
            link,
            github,
            image,
          }: {
            name: string;
            description: string;
            link: string;
            github: string;
            image: string;
          }) => (
            <Card
              key={name}
              name={name}
              description={description}
              link={link}
              github={github}
              image={image}
            />
          ),
        )}
      </div>
    </section>
  );
};
