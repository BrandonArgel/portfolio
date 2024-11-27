import * as React from 'react';
import { Outlet } from 'react-router-dom';
import { Header, Footer } from '@components';
import { LanguageContext } from '@context';

const Particles = React.lazy(() =>
  import('@components').then(({ Particles }) => ({
    default: Particles,
  })),
);

const Layout = () => {
  const {
    texts: { skipToContent },
  } = React.useContext(LanguageContext);

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
      <Particles />
    </>
  );
};

export { Layout };
