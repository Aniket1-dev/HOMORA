import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './src/utils/App.jsx';
import './src/utils/index.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('HOMORA root element #root was not found in index.html');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
