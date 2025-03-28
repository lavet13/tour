import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { ReactQueryProvider } from '@/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { Toaster } from '@/components/ui/toaster';
import { type ToasterProps } from 'sonner';
import { CookiesProvider } from 'react-cookie';
import { TooltipProvider } from '@radix-ui/react-tooltip';

const toastOptions = {
  classNames: {
    toast:
      'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:pointer-events-auto',
    description: 'group-[.toast]:text-muted-foreground',
    actionButton:
      'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
    cancelButton:
      'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
  },
} as const satisfies ToasterProps['toastOptions'];

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <CookiesProvider>
        <ReactQueryProvider>
          <SonnerToaster
            toastOptions={toastOptions}
            visibleToasts={6}
            position={'bottom-center'}
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
