import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Create React root and render the App component
const rootElement = document.getElementById('game-container');

if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 