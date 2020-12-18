import React, {useState} from 'react'
import {Button, Grid, Box} from "@material-ui/core";
import MessageService from "../../shared/admin/MessageService";
import {useSnackbar} from "notistack";
import {useTranslation} from "react-i18next";

export default function SendToMeButton({adminId, messageObj, selectedRecipient}) {

  const {enqueueSnackbar} = useSnackbar();
  const {t} = useTranslation('admin');

  const [isSending, setIsSending] = useState(false);

  const handleSendToMe = async () => {
    setIsSending(true);
    const message = MessageService.getMailMessageForSelectedRecipient(messageObj, selectedRecipient);
    MessageService.sendParticipantMessagesAsync(adminId, message, true)
        .then(() => enqueueSnackbar(t('mails_send_to_dinner_owner'), {variant: 'success'}))
        .finally(() => setIsSending(false));
  };

  return (
      <Grid container justify={"flex-end"}>
        <Grid item>
          <Box mt={1}>
            <Button disabled={isSending} onClick={handleSendToMe} color="primary">An mich versenden (Test)</Button>
          </Box>
        </Grid>
      </Grid>
  );

}
