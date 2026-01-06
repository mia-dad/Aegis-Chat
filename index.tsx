import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log('Initializing Aegis Chat Application...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error("Could not find root element to mount to");
  }

  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('App mounted successfully.');
} catch (error) {
  console.error('Failed to mount application:', error);
  document.body.innerHTML = `<div style="color:red; padding:20px;"><h3>Application Error</h3><pre>${error}</pre></div>`;
}