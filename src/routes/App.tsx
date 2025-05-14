import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, Loader } from '@components';
import { LanguageProvider } from '@context';

const Home = React.lazy(() =>
  import('@pages').then(({ Home }) => ({
    default: Home,
  })),
);

const App = () => {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <React.Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
            </Route>
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </LanguageProvider>
  );
};

export default App;
