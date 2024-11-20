import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ReactQueryProvider } from '@/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { CookiesProvider } from 'react-cookie';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CookiesProvider>
      <BrowserRouter>
        <ReactQueryProvider>
          <Toaster />
          <App />
        </ReactQueryProvider>
      </BrowserRouter>
    </CookiesProvider>
  </StrictMode>,
);
