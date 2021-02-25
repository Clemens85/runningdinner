import React from 'react';
import {Alert} from "@material-ui/lab";
import {useAdminContext} from "../AdminContext";
import {
  CONSTANTS,
  isAcknowledgeRequired,
  isNotificationRequired,
  formatLocalDateWithSeconds,
  useDisclosure
} from "@runningdinner/shared";
import {useTranslation} from "react-i18next";
import {Box} from "@material-ui/core";

export default function AdminNotificationBar() {

  const {runningDinner} = useAdminContext();
  const {cancellationDate, acknowledgedDate, runningDinnerType} = runningDinner;

  const notificationRequired = isNotificationRequired(runningDinner);

  const {t} = useTranslation('admin');

  // For now it is good enough to hold the state just locally (=> alert will disappear as long as user do not refresh browser)
  const {isOpen, close} = useDisclosure(notificationRequired);

  if (!notificationRequired) {
    return null;
  }

  let notificationMessage = [];
  if (cancellationDate) {
    var cancellationDateFormatted = formatLocalDateWithSeconds(cancellationDate);
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
        { isOpen && <Alert severity={severity} icon={false} onClose={close}>
                      {notificationMessage}
                    </Alert> }
      </>
  );
};
