import { lazy, Suspense, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { Header, Footer } from '@components';
import { LanguageContext } from '@context';

const Particles = lazy(() =>
  import('@components').then(({ Particles }) => ({
    default: Particles,
  })),
);

export const Layout = () => {
  const {
    texts: { skipToContent },
  } = useContext(LanguageContext);

  return (
    <>
      <a className="skip-to-content" href="#content">
        {skipToContent}
      </a>
      <Header />
      <main id="content">
        <Outlet />
        <Footer />
      </main>
      <Suspense fallback={null}>
        <Particles />
      </Suspense>
    </>
  );
};
