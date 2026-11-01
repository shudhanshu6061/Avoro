import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App.tsx';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename="/admin">
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#FFFFFF', color: '#2C2620', border: '1px solid #E8E2D9', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
