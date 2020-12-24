import React, {useState} from 'react'
import {Button, Grid, Box} from "@material-ui/core";
import MessageService from "../../shared/admin/MessageService";
import {useSnackbar} from "notistack";
import {useTranslation} from "react-i18next";
import {SecondaryButtonAsync} from "common/theme/SecondaryButtonAsync";

export default function SendToMeButton({adminId, messageObj, messageType, selectedRecipient}) {

  const {enqueueSnackbar} = useSnackbar();
  const {t} = useTranslation('admin');

  const handleSendToMe = () => {
    const message = MessageService.getMailMessageForSelectedRecipient(messageObj, selectedRecipient);
    MessageService.sendMessagesAsync(adminId, message, messageType, true)
        .then(() => enqueueSnackbar(t('mails_send_to_dinner_owner'), {variant: 'success'}));
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
