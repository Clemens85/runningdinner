import React from 'react'
import {Route, BrowserRouter as Router, Switch} from "react-router-dom";
import AdminApp from "./admin/AdminApp";
import LandingApp from "./landing/LandingApp";
import { ThemeProvider } from '@material-ui/core/styles';
import { runningDinnerTheme } from './common/theme/RunningDinnerTheme';
import { loadCSS } from 'fg-loadcss';
import {AdminContextProvider} from "./admin/AdminContext";
import { HelmetProvider } from 'react-helmet-async';

export default function App() {

  React.useEffect(() => {
    loadCSS(
        'https://use.fontawesome.com/releases/v5.12.0/css/all.css',
        document.querySelector('#font-awesome-css'),
    );
  }, []);

  return (
      <HelmetProvider>
        <Router>
            <Switch>
                <Route path="/admin/:adminId">
                  <ThemeProvider theme={runningDinnerTheme}>
                    <AdminContextProvider>
                      <AdminApp></AdminApp>
                    </AdminContextProvider>
                  </ThemeProvider>
                </Route>
                <Route path="/">
                  <LandingApp></LandingApp>
                </Route>
            </Switch>
        </Router>
      </HelmetProvider>
  );
}
