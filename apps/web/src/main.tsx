import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SdkProvider } from '@org/internal-sdk';
import { App } from './app';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Failed to find root element');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <SdkProvider apiBaseUrl="/api/v1">
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#18181b',
              color: '#f4f4f5',
              border: '1px solid #27272a',
              fontSize: '13px',
            },
          }}
        />
      </BrowserRouter>
    </SdkProvider>
  </React.StrictMode>
);
