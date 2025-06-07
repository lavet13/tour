import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { ReactQueryProvider } from '@/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { CookiesProvider } from 'react-cookie';
import { TooltipProvider } from '@radix-ui/react-tooltip';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CookiesProvider>
        <ReactQueryProvider>
          <SonnerToaster
            visibleToasts={6}
            position={'top-center'}
            pauseWhenPageIsHidden
          />
          <Toaster />
          <TooltipProvider
            disableHoverableContent={true}
            delayDuration={0}
            skipDelayDuration={0}
          >
            <App />
          </TooltipProvider>
        </ReactQueryProvider>
      </CookiesProvider>
    </BrowserRouter>
  </StrictMode>,
);
