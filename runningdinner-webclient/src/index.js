import React from 'react';
import ReactDOM from 'react-dom';
import App from "./App";
import CssBaseline from "@material-ui/core/CssBaseline";
import {configureAxiosHttpInterceptors} from "./shared/HttpInterceptorConfig";
import {SnackbarProvider} from "notistack";
import "./shared/i18n/i18n";
import BackendConfig from "./shared/BackendConfig";

configureAxiosHttpInterceptors();
BackendConfig.setBaseUrl(process.env.REACT_APP_BACKEND_BASE_URL);

ReactDOM.render(
    <React.StrictMode>
      <CssBaseline />
        <SnackbarProvider maxSnack={3} anchorOrigin={{vertical: 'top', horizontal: 'center'}} autoHideDuration={4500}>
          <App></App>
        </SnackbarProvider>
    </React.StrictMode>,
    document.getElementById('root')
);
