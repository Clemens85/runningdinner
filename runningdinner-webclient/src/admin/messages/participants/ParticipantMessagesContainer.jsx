import React, {useState} from 'react'
import { Grid, Paper, Box } from "@material-ui/core";
import ParticipantMessageForm from "./ParticipantMessageForm";
import MessagePreview from "../MessagePreview";
import {useSnackbar} from "notistack";
import ParticipantService from "../../../shared/admin/ParticipantService";
import MessageService from "../../../shared/admin/MessageService";
import {mapValidationIssuesToErrorObjects} from "../../../shared/Utils";
import {FormContext, useForm} from "react-hook-form";
import ParticipantSelection from "../ParticipantSelection";
import MessageContent from "../MessageContent";
import debounce from 'lodash/debounce';
import {PARTICIPANT_MESSAGE_VALIDATION_SCHEMA} from "../../../shared/admin/ValidationSchemas";
import MessageSubject from "../MessageSubject";
import Fetch from "../../../common/Fetch";
import {PageTitle} from "../../../common/theme/typography/Tags";

export default function ParticipantMessagesContainer({adminId}) {

  return <Fetch asyncFunction={ParticipantService.findParticipantsAsync}
                parameters={[adminId]}
                render={(result) => <ParticipantMessages adminId={adminId} participants={result.participants}/>} />
}

function ParticipantMessages({adminId, participants}) {

  console.log('Rendering ParticipantMessages');

  const {enqueueSnackbar} = useSnackbar();

  const updatePreviewMessage = debounce((key, value) => {
    const updatedPreviewMessage =  {...previewMessage };
    updatedPreviewMessage[key] = value;
    setPreviewMessage(updatedPreviewMessage);
  }, 100);

  const [previewMessage, setPreviewMessage] = useState(MessageService.getExampleParticipantMessage);

  const [customSelectedEntities, setCustomSelectedEntities] = useState([]);
  const handleCustomSelectedEntitiesChange = (updatedCustomSelectedEntities) => {
    setCustomSelectedEntities(updatedCustomSelectedEntities);
  };

  const formMethods = useForm({
    defaultValues: MessageService.getExampleParticipantMessage(),
    validationSchema: PARTICIPANT_MESSAGE_VALIDATION_SCHEMA,
    mode: 'onBlur'
  });
  const { handleSubmit, clearError, setError, formState } = formMethods;
  const { isSubmitting } = formState;

  const handleSendMessages = async (values) => {
    clearError();
    console.log(`SendMessages with ${JSON.stringify(values)}`);
    try {
      await MessageService.sendParticipantMessagesAsync(adminId, values, false);
      enqueueSnackbar('Nachrichten erfolgreich versandt', { variant: 'success'});
    } catch(e) {
      const validationErrors = mapValidationIssuesToErrorObjects(e);
      setError(validationErrors);
    }
  };

  const templates = ['{firstname}', '{lastname}'];
  const recipientsControl = <ParticipantSelection participants={participants} customSelectedEntities={customSelectedEntities} onCustomSelectedEntitiesChange={handleCustomSelectedEntitiesChange} />;
  const messageContentControl = <MessageContent templates={templates} onMessageContentChange={content => updatePreviewMessage('message', content)}/>;
  const messageSubjectControl = <MessageSubject onMessageSubjectChange={subject => updatePreviewMessage('subject', subject)}/>;

  return (
      <>
        <Grid container>
          <Grid item xs={12}>
            <PageTitle>Teilnehmer Mail Versand</PageTitle>
          </Grid>
        </Grid>

        <FormContext {...formMethods}>
          <form>

            <Grid container spacing={3}>
              <Grid item xs={12} lg={7}>
                <Paper elevation={3}>
                  <Box p={2}>
                    <ParticipantMessageForm adminId={adminId}
                                            recipientsControl={recipientsControl}
                                            messageContentControl={messageContentControl}
                                            messageSubjectControl={messageSubjectControl}
                                            isSubmitting={isSubmitting}
                                            submitForm={handleSubmit(handleSendMessages)} />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} lg={5}>
                <Grid item xs={12}>
                  <Paper elevation={3}>
                    Protokolle
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Box mt={3}>
                    <Paper elevation={3}>
                      <Box p={2}>
                        { participants && participants.length > 0 && <MessagePreview adminId={adminId}
                                                                                     participants={participants}
                                                                                     messageObj={previewMessage}  /> }
                      </Box>
                    </Paper>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

          </form>
        </FormContext>

      </>
  );

}
