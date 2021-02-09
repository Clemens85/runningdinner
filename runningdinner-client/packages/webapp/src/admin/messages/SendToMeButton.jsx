import React from 'react'
import {Grid, Box} from "@material-ui/core";
import {useSnackbar} from "notistack";
import {useTranslation} from "react-i18next";
import {SecondaryButtonAsync} from "../../common/theme/SecondaryButtonAsync";
import useHttpErrorHandler from "../../common/HttpErrorHandlerHook";
import {getMailMessageForSelectedRecipient, sendMessagesAsync} from "@runningdinner/shared";

export default function SendToMeButton({adminId, messageObj, messageType, selectedRecipient}) {

  const {enqueueSnackbar} = useSnackbar();
  const {t} = useTranslation('admin');
  const {handleError} = useHttpErrorHandler();

  const handleSendToMe = () => {
    const message = getMailMessageForSelectedRecipient(messageObj, selectedRecipient);
    sendMessagesAsync(adminId, message, messageType, true)
        .then(() => enqueueSnackbar(t('mails_send_to_dinner_owner'), {variant: 'success'}))
        .catch((error) => handleError(error, true));
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
