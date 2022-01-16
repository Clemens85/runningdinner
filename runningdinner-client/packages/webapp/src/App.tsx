import React, { Suspense } from 'react';
import {HelmetProvider} from "react-helmet-async";
import {Route, BrowserRouter as Router, Switch} from "react-router-dom";
import { ThemeProvider } from '@material-ui/core/styles';
import { runningDinnerTheme } from './common/theme/RunningDinnerTheme';
import {WIZARD_ROOT_PATH} from "./common/mainnavigation/NavigationPaths";
import {ProgressBar} from "./common/ProgressBar";
const SelfAdminApp = React.lazy(() => import('./self/SelfAdminApp'));
const WizardApp = React.lazy(() => import('./wizard/WizardApp'));
const LandingApp = React.lazy(() => import('./landing/LandingApp'));
const AdminApp = React.lazy(() => import('./admin/AdminApp'));

function App() {

  if (isBackendCall()) {
    return null;
  }

  return (
      <HelmetProvider>
        <ThemeProvider theme={runningDinnerTheme}>
            <Router>
              <Switch>
                <Route path="/admin/:adminId" render={() => (
                  <Suspense fallback={<ProgressBar showLoadingProgress={true} />}>
                    <AdminApp />
                  </Suspense>
                )} />
                <Route path={WIZARD_ROOT_PATH} render={() => (
                  <Suspense fallback={<ProgressBar showLoadingProgress={true} />}>
                    <WizardApp />
                  </Suspense>
                )} />
                <Route path="/self/:selfAdminId" render={() => (
                  <Suspense fallback={<ProgressBar showLoadingProgress={true} />}>
                    <SelfAdminApp />
                  </Suspense>
                )} />
                <Route path="/" render={props => (
                  <Suspense fallback={<ProgressBar showLoadingProgress={true} />}>
                    <LandingApp />
                  </Suspense>
                )} />
              </Switch>
            </Router>
        </ThemeProvider>
      </HelmetProvider>
  );
}

// This is not very elegant, but works for now quite simple this way...
const BACKEND_URL_PARTS = [
  "/rest/",
  "/resources/"
];
function isBackendCall() {
  const pathName = window.location.pathname;
  for (let i = 0; i < BACKEND_URL_PARTS.length; i++) {
    if (pathName.toLowerCase().indexOf(BACKEND_URL_PARTS[i]) >= 0) {
      return true;
    }
  }
  return false;
}

export default App;
