import {
  useBackendIssueHandler,
  HttpError
} from "@runningdinner/shared";
import {useNotificationHttpError} from "./NotificationHttpErrorHook";
import React from "react";
import {LinearProgress} from "@material-ui/core";


export interface ProgressBarProps {
  showLoadingProgress: boolean;
  fetchError?: HttpError;
}

export function ProgressBar({showLoadingProgress, fetchError}: ProgressBarProps) {

  const {getIssuesTranslated} = useBackendIssueHandler();
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  React.useEffect(() => {
    if (fetchError) {
      showHttpErrorDefaultNotification(fetchError);
    }
    // eslint-disable-next-line
  }, [fetchError]);

  return (
    <>
      { showLoadingProgress && <LinearProgress color="secondary" /> }
    </>
  );

}