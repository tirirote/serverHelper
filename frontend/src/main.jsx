import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { ToastProvider } from './components/ui/toasts/ToastProvider.jsx'; // Correct import path
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap the entire App component with ToastProvider */}
    <ToastProvider>
      <App />
    </ToastProvider>
  </React.StrictMode>,
);