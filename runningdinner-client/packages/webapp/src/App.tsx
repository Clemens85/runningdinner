import React from 'react';
import {HelmetProvider} from "react-helmet-async";
import {Route, BrowserRouter as Router, Switch} from "react-router-dom";
import AdminApp from "./admin/AdminApp";
import LandingApp from "./landing/LandingApp";
import { ThemeProvider } from '@material-ui/core/styles';
import { runningDinnerTheme } from './common/theme/RunningDinnerTheme';
import WizardApp from './wizard/WizardApp';
import SelfAdminApp from "./self/SelfAdminApp";

function App() {
  return (
      <HelmetProvider>
        <ThemeProvider theme={runningDinnerTheme}>
          <Router>
            <Switch>
              <Route path="/admin/:adminId">
                <AdminApp />
              </Route>
              <Route path="/running-dinner-wizard">
                <WizardApp />
              </Route>
              <Route path="/self/:selfAdminId">
                <SelfAdminApp />
              </Route>
              <Route path="/">
                <LandingApp />
              </Route>
            </Switch>
          </Router>
        </ThemeProvider>
      </HelmetProvider>
  );

}

export default App;
