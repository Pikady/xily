import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import { initializeStores } from './stores';

console.log('[main.tsx] start');

const container = document.getElementById('root');
if (!container) {
  console.error('[main.tsx] #root not found');
} else {
  console.log('[main.tsx] #root found');
}
const root = createRoot(container!);

// 初始化应用Stores
initializeStores().then(() => {
  console.log('[main.tsx] Stores initialized');
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}).catch(error => {
  console.error('[main.tsx] Failed to initialize stores:', error);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});