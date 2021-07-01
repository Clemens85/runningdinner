import {
  useBackendIssueHandler,
  useAdminSelector,
  isFetchingDataSelector,
  getFetchDataErrorSelector
} from "@runningdinner/shared";
import {useNotificationHttpError} from "../common/NotificationHttpErrorHook";
import React from "react";
import {LinearProgress} from "@material-ui/core";

export function AdminProgressBar() {

  const showLoadingProgress = useAdminSelector(isFetchingDataSelector);
  const fetchError = useAdminSelector(getFetchDataErrorSelector);

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