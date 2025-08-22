import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from '@routes/App';
import '@styles/main.scss';

ReactDOM.createRoot(document.getElementById('app') as HTMLDivElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
