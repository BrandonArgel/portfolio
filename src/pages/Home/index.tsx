import { lazy, Suspense, useEffect } from 'react';
import { Hero, Loader } from '@components';
const About = lazy(() =>
  import('@components').then(({ About }) => ({
    default: About,
  })),
);
const Education = lazy(() =>
  import('@components').then(({ Education }) => ({
    default: Education,
  })),
);
const Jobs = lazy(() =>
  import('@components').then(({ Jobs }) => ({
    default: Jobs,
  })),
);
const Projects = lazy(() =>
  import('@components').then(({ Projects }) => ({
    default: Projects,
  })),
);
const Contact = lazy(() =>
  import('@components').then(({ Contact }) => ({
    default: Contact,
  })),
);

export const Home = () => {
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.substring(1);

      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView();
          el.focus();
        }
      }, 0);
    }
  });

  return (
    <>
      <Hero />
      <Suspense fallback={<Loader />}>
        <About />
        <Education />
        <Jobs />
        <Projects />
        <Contact />
      </Suspense>
    </>
  );
};
