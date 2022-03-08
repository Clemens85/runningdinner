import React from 'react';
import {
  CONSTANTS,
  isAcknowledgeRequired,
  isNotificationRequired,
  formatLocalDateWithSeconds,
  useDisclosure, useAdminSelector, getRunningDinnerFetchSelector, RunningDinner
} from "@runningdinner/shared";
import {useTranslation} from "react-i18next";
import {Box} from "@material-ui/core";
import AlertCentered from "../../common/theme/AlertCentered";
import {FetchData} from "@runningdinner/shared/src/redux";

export default function AdminNotificationBar() {

  const {t} = useTranslation('admin');

  const runningDinnerFetchData = useAdminSelector(getRunningDinnerFetchSelector);
  const notificationRequired = isNotificationRequiredForFetchedRunningDinner(runningDinnerFetchData);

  // For now it is good enough to hold the state just locally (=> alert will disappear as long as user do not refresh browser)
  const {isOpen, close, open} = useDisclosure(notificationRequired);

  React.useEffect(() => {
    if (notificationRequired) {
      open();
    }
    // eslint-disable-next-line
  }, [notificationRequired]);

  if (!notificationRequired) {
    return null;
  }

  const runningDinner = runningDinnerFetchData.data!;
  const {cancellationDate, acknowledgedDate, runningDinnerType} = runningDinner;

  let notificationMessage = [];
  if (cancellationDate) {
    const cancellationDateFormatted = formatLocalDateWithSeconds(cancellationDate);
    notificationMessage.push(<Box key="cancellationDate">{t('notification_dinner_cancellation_text', { cancellationDate: cancellationDateFormatted })}</Box>);
  } else if (isAcknowledgeRequired(runningDinner)) {
    notificationMessage.push(<Box key="acknowledgedDate">{t("notification_dinner_acknowledge_required")}</Box>);
  } else if (runningDinnerType === CONSTANTS.RUNNING_DINNER_TYPE.DEMO) {
    notificationMessage.push(<Box key="demo">{t("notification_dinner_demo_mode")}</Box>);
    if (!acknowledgedDate) {
      notificationMessage.push(<Box key="acknowledgedDate">{t("notification_dinner_acknowledge_required")}</Box>);
    }
  }

  const severity = cancellationDate ? "error" : "info";
  return (
      <>
        { isOpen && <AlertCentered severity={severity} icon={false} onClose={close}>
                      {notificationMessage}
                    </AlertCentered> }
      </>
  );
};

function isNotificationRequiredForFetchedRunningDinner(runningDinnerFetchData: FetchData<RunningDinner>) {
  return runningDinnerFetchData.data && isNotificationRequired(runningDinnerFetchData.data);
}