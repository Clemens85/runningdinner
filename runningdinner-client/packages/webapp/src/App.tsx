import React from 'react';
import {HelmetProvider} from "react-helmet-async";
import {Route, BrowserRouter as Router, Switch} from "react-router-dom";
import AdminApp from "./admin/AdminApp";
import LandingApp from "./landing/LandingApp";
import { ThemeProvider } from '@material-ui/core/styles';
import { runningDinnerTheme } from './common/theme/RunningDinnerTheme';

function App() {
  return (
      <HelmetProvider>
        <Router>
          <Switch>
            <Route path="/admin/:adminId">
              <ThemeProvider theme={runningDinnerTheme}>
                <AdminApp />
              </ThemeProvider>
            </Route>
            <Route path="/">
              <LandingApp />
            </Route>
          </Switch>
        </Router>
      </HelmetProvider>
  );

}

export default App;
