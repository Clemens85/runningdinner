import React from 'react';
import ReactDOM from 'react-dom';
import App from "./App";
import CssBaseline from "@mui/material/CssBaseline";
import {SnackbarProvider} from "notistack";
import {configureAxiosHttpInterceptors, BackendConfig, setupI18n} from "@runningdinner/shared";
import { LanguageChangeHandler } from './common/i18n/LanguageChangeHandler';

configureAxiosHttpInterceptors();
BackendConfig.setBaseUrl(process.env.REACT_APP_BACKEND_BASE_URL);
setupI18n();

ReactDOM.render(
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
    document.getElementById('root')
);




// import React from 'react';
// import ReactDOM from 'react-dom';
// import App from './App';
// import reportWebVitals from './reportWebVitals';
//
// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );
//
// // If you want to start measuring performance in your app, pass a function
// // to log results (for example: reportWebVitals(console.log))
// // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
