import * as React from 'react';
import ReactDOM from 'react-dom';
import App from './routes/App';
import reportWebVitals from './reportWebVitals';
import 'styles/global.scss';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('app')
);

reportWebVitals();
