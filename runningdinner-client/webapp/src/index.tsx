import CssBaseline from '@mui/material/CssBaseline';
import { configureAxiosHttpInterceptors, createDefaultQueryClient, setupI18n } from '@runningdinner/shared';
import { QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { createRoot } from 'react-dom/client';

import App from './App';
import { LanguageChangeHandler } from './common/i18n/LanguageChangeHandler';

configureAxiosHttpInterceptors();

setupI18n();

const queryClient = createDefaultQueryClient();

createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <>
    <CssBaseline />
    <LanguageChangeHandler />
    <QueryClientProvider client={queryClient}>
      <SnackbarProvider maxSnack={3} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} autoHideDuration={4500} hideIconVariant={true}>
        <App />
      </SnackbarProvider>
    </QueryClientProvider>
  </>,
  // </React.StrictMode>,
);
