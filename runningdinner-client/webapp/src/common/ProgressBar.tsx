import { LinearProgress } from '@mui/material';
import { HttpError,useBackendIssueHandler } from '@runningdinner/shared';
import React from 'react';

import { useNotificationHttpError } from './NotificationHttpErrorHook';

export interface ProgressBarProps {
  showLoadingProgress: boolean;
  fetchError?: HttpError | null;
}

export function ProgressBar({ showLoadingProgress, fetchError }: ProgressBarProps) {
  const { getIssuesTranslated } = useBackendIssueHandler();
  const { showHttpErrorDefaultNotification } = useNotificationHttpError(getIssuesTranslated);

  React.useEffect(() => {
    if (fetchError) {
      showHttpErrorDefaultNotification(fetchError);
    }
    // eslint-disable-next-line
  }, [fetchError]);

  return <>{showLoadingProgress && <LinearProgress color="secondary" />}</>;
}
