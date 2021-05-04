import React from 'react'
import {Grid, Box} from "@material-ui/core";
import {useTranslation} from "react-i18next";
import {SecondaryButtonAsync} from "../../common/theme/SecondaryButtonAsync";
import {getMailMessageForSelectedRecipient, sendMessagesAsync, useBackendIssueHandler} from "@runningdinner/shared";
import {useNotificationHttpError} from "../../common/NotificationHttpErrorHook";
import {useCustomSnackbar} from "../../common/theme/CustomSnackbarHook";

export default function SendToMeButton({adminId, messageObj, messageType, selectedRecipient}) {

  const {showSuccess} = useCustomSnackbar();
  const {t} = useTranslation('admin');

  const {getIssuesTranslated} = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: 'admin'
    }
  });
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  const handleSendToMe = () => {
    const message = getMailMessageForSelectedRecipient(messageObj, messageType, selectedRecipient);
    sendMessagesAsync(adminId, message, messageType, true)
        .then(() => showSuccess(t('mails_send_to_dinner_owner')))
        .catch((error) => showHttpErrorDefaultNotification(error));
  };

  return (
      <Grid container justify={"flex-end"}>
        <Grid item>
          <Box mt={1}>
            <SecondaryButtonAsync onClick={handleSendToMe} color="primary">{t('message_send_to_me')}</SecondaryButtonAsync>
          </Box>
        </Grid>
      </Grid>
  );

}
