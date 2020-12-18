import {Box, Grid, LinearProgress, Paper} from "@material-ui/core";
import {PageTitle} from "common/theme/typography/Tags";
import {FormContext, useForm} from "react-hook-form";
import React from "react";
import {useTranslation} from "react-i18next";
import {MessageJobsOverview} from "admin/messages/messagejobs/MessageJobsOverview";
import MessageHeadline from "admin/messages/MessageHeadline";
import {PrimaryButton} from "common/theme/PrimaryButton";
import MessageSubject from "admin/messages/MessageSubject";
import MessageContent from "admin/messages/teams/MessageContent";
import {mapValidationIssuesToErrorObjects} from "shared/Utils";
import {
  TeamMessagesFetchData,
  TeamMessagesProvider,
  updateMessageContentPreviewAsync,
  updateMessageSubjectPreviewAsync,
  useTeamMessagesDispatch,
  useTeamMessagesState
} from "admin/messages/teams/TeamMessagesContext";
import {TeamSelection} from "admin/messages/teams/TeamSelection";
import MessageService from "shared/admin/MessageService";
import {MessagePreview} from "admin/messages/teams/MessagePreview";

const TeamMessagesContainer = ({adminId}) => {
  return (
      <TeamMessagesProvider>
        <TeamMessagesFetchData adminId={adminId}>
          <TeamMessagesView />
        </TeamMessagesFetchData>
      </TeamMessagesProvider>
  );
};

function TeamMessagesView({adminId}) {

  const {t} = useTranslation('admin');

  const {loadingData} = useTeamMessagesState();
  const dispatch = useTeamMessagesDispatch();

  const formMethods = useForm({
    defaultValues: MessageService.getExampleTeamMessage(),
    // validationSchema: PARTICIPANT_MESSAGE_VALIDATION_SCHEMA,
    mode: 'onBlur'
  });
  const { handleSubmit, clearError, setError, formState } = formMethods;
  const { isSubmitting } = formState;

  const handleSendMessages = async (values) => {
    clearError();
    console.log(`SendMessages with ${JSON.stringify(values)}`);
    try {
      await MessageService.sendTeamMessagesAsync(adminId, values, false);
    } catch(e) {
      const validationErrors = mapValidationIssuesToErrorObjects(e);
      setError(validationErrors);
    }
  };

  const handleMessageContentChange = content => updateMessageContentPreviewAsync(content, dispatch);
  const handleMessageSubjectChange = subject => updateMessageSubjectPreviewAsync(subject, dispatch);

  if (loadingData) {
    return <LinearProgress color="secondary" />;
  }

  const templates = ['{firstname}', '{lastname}', '{meal}', '{mealtime}', '{host}', '{partner}', '{managehostlink}'];

  return (
      <>
        <Grid container>
          <Grid item xs={12}>
            <PageTitle>{t('admin:mails_team_sendmessage_headline')}</PageTitle>
          </Grid>
        </Grid>

        <FormContext {...formMethods}>
          <form>

            <Grid container spacing={3}>

              <Grid item xs={12} lg={7}>
                <Paper elevation={3}>
                  <Box p={2}>
                    <Grid container>
                      <Grid item xs={12}>
                        <MessageHeadline />
                      </Grid>
                      <Grid item xs={12}>
                        <TeamSelection />
                        <MessageSubject onMessageSubjectChange={handleMessageSubjectChange}/>
                        <MessageContent templates={templates} onMessageContentChange={handleMessageContentChange} rows={15}/>
                      </Grid>
                      <Grid container justify="flex-end">
                        <Grid item>
                          <Box mt={3}>
                            <PrimaryButton onClick={handleSubmit(handleSendMessages)}
                                           disabled={isSubmitting}
                                           size="large">
                              {t('messages_send_general')}
                            </PrimaryButton>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={5}>
                <Grid item xs={12}>
                  <MessageJobsOverview />
                </Grid>
                <Grid item xs={12}>
                  <Box mt={3}>
                    <Paper elevation={3}>
                      <Box p={2}>
                        <MessagePreview adminId={adminId} />
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

export {
  TeamMessagesContainer
};
