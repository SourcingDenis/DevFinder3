import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Add theme script to prevent flash of wrong theme
const themeScript = `
  let theme = localStorage.getItem('theme');
  if (!theme) {
    theme = 'dark';
    localStorage.setItem('theme', 'dark');
  }
  document.documentElement.classList.add(theme);
`;

const themeElement = document.createElement('script');
themeElement.innerHTML = themeScript;
document.head.appendChild(themeElement);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);