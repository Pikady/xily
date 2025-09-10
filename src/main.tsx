import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';

console.log('[main.tsx] start');

const container = document.getElementById('root');
if (!container) {
  console.error('[main.tsx] #root not found');
} else {
  console.log('[main.tsx] #root found');
}
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);