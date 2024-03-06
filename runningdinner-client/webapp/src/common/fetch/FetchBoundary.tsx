import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import React from "react";
import { ProgressBar } from "../ProgressBar";
import { PrimaryButton } from "../theme/PrimaryButton";
import { Trans } from "react-i18next";
import { useBackendIssueHandler } from "@runningdinner/shared";
import { useNotificationHttpError } from "../NotificationHttpErrorHook";

export const FetchBoundary = ({ children }: { children: React.ReactNode }) => (
  <QueryErrorResetBoundary>
    {({ reset }) => (
      <ErrorBoundary onReset={reset} FallbackComponent={FetchErrorView}>
        <React.Suspense fallback={<ProgressBar showLoadingProgress={true} />}>
          {children}
        </React.Suspense>
      </ErrorBoundary>
    )}
  </QueryErrorResetBoundary>
);


const FetchErrorView = ({ error, resetErrorBoundary }: FallbackProps) => {

  const {getIssuesTranslated} = useBackendIssueHandler();
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  React.useEffect(() => {
    if (error) {
      showHttpErrorDefaultNotification(error);
    }
    // eslint-disable-next-line
  }, [error]);

  return (
    <div>
        <PrimaryButton onClick={resetErrorBoundary}>
          <Trans i18nKey="common:client_error_action" />
        </PrimaryButton>
    </div>
  );
};