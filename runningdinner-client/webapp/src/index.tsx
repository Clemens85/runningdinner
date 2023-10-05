import React from 'react';
import App from "./App";
import CssBaseline from "@mui/material/CssBaseline";
import {SnackbarProvider} from "notistack";
import {configureAxiosHttpInterceptors, BackendConfig, setupI18n} from "@runningdinner/shared";
import { LanguageChangeHandler } from './common/i18n/LanguageChangeHandler';
import { createRoot } from 'react-dom/client';

configureAxiosHttpInterceptors();
BackendConfig.setBaseUrl(process.env.REACT_APP_BACKEND_BASE_URL);
setupI18n();

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CssBaseline />
    <LanguageChangeHandler />
    <SnackbarProvider maxSnack={3}
                      anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                      autoHideDuration={4500}
                      hideIconVariant={true}>
      <App />
    </SnackbarProvider>
  </React.StrictMode>,
);


