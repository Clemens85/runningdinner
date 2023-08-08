import React, { Suspense } from 'react';
import {HelmetProvider} from "react-helmet-async";
import {Route, BrowserRouter as Router, Routes} from "react-router-dom";
import { ThemeProvider, Theme, StyledEngineProvider } from '@mui/material/styles';
import { runningDinnerTheme } from './common/theme/RunningDinnerTheme';
import {WIZARD_ROOT_PATH} from "./common/mainnavigation/NavigationPaths";
import {ProgressBar} from "./common/ProgressBar";
import { ErrorBoundary } from './ErrorBoundary';


declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}


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
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={runningDinnerTheme}>
          <ErrorBoundary>
            <Router>
              <Routes>
                <Route path="/*" element={
                  <Suspense fallback={<ProgressBar showLoadingProgress={true} />}>
                    <LandingApp />
                  </Suspense>
                } />
                <Route path="/admin/:adminId/*" element={
                  <Suspense fallback={<ProgressBar showLoadingProgress={true} />}>
                    <AdminApp />
                  </Suspense>
                } />
                <Route path={`${WIZARD_ROOT_PATH}/*`} element={
                  <Suspense fallback={<ProgressBar showLoadingProgress={true} />}>
                    <WizardApp />
                  </Suspense>
                } />
                <Route path="/self/*" element={
                  <Suspense fallback={<ProgressBar showLoadingProgress={true} />}>
                    <SelfAdminApp />
                  </Suspense>
                } />
              </Routes>
            </Router>
          </ErrorBoundary>
        </ThemeProvider>
      </StyledEngineProvider>
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
