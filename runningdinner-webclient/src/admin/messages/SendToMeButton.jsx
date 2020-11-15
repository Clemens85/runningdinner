import React, {useState} from 'react'
import {Button, Grid, Box} from "@material-ui/core";
import MessageService from "../../shared/admin/MessageService";
import {useSnackbar} from "notistack";

export default function SendToMeButton({adminId, messageObj, selectedParticipant}) {

  const {enqueueSnackbar} = useSnackbar();

  const [isSending, setIsSending] = useState(false);

  const handleSendToMe = async () => {
    setIsSending(true);
    const message = MessageService.getMailMessageForSelectedParticipant(messageObj, selectedParticipant);
    MessageService.sendParticipantMessagesAsync(adminId, message, true)
        .then(() => enqueueSnackbar('Test-Email(s) erfolgreich versandt. Bitte überprüfe dein EMail-Postfach.', {variant: 'success'}))
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
