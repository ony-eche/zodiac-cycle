import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App.tsx';
import './styles/index.css';

console.log('[main] Starting application...');

// Global error handler for uncaught errors
window.addEventListener('error', (event) => {
  console.error('[Global Error]', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
  alert(`Error: ${event.message}\nSee console for details`);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', event.reason);
  alert(`Promise Error: ${event.reason}`);
});

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found');
  }
  
  console.log('[main] Rendering app...');
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log('[main] App rendered successfully');
} catch (error) {
  console.error('[main] Fatal error:', error);
  document.body.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: sans-serif;">
      <h1>Something went wrong</h1>
      <p style="color: red;">${error instanceof Error ? error.message : 'Unknown error'}</p>
      <button onclick="window.location.reload()">Retry</button>
    </div>
  `;
}