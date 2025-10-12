import React from 'react';
import ReactDOM from 'react-dom/client';
import AppLayout from './AppLayout.jsx';
import { BrowserRouter } from 'react-router-dom'; 

import { ToastProvider } from './components/ui/toasts/ToastProvider.jsx'; // Correct import path
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Wrap the entire App component with ToastProvider */}
    <BrowserRouter>
      <ToastProvider>
        <AppLayout />
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
);