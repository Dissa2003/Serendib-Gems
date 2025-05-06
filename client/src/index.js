// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './ThemeContext'; // Import ThemeProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider> {/* Wrap App and Toaster in ThemeProvider */}
      <App />
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>
);