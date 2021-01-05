import {Box, Grid, LinearProgress, Paper} from "@material-ui/core";
import {PageTitle} from "common/theme/typography/Tags";
import {FormContext, useForm} from "react-hook-form";
import React from "react";
import {useTranslation} from "react-i18next";
import {MessageJobsOverview} from "admin/messages/messagejobs/MessageJobsOverview";
import MessageHeadline from "admin/messages/MessageHeadline";
import {PrimaryButton} from "common/theme/PrimaryButton";
import MessageSubject from "admin/messages/MessageSubject";
import MessageContent from "admin/messages/MessageContent";
import {
  ADD_MESSAGEJOB,
  MessagesFetchData,
  MessagesProvider, newAction,
  updateHostMessagePartTemplatePreviewAsync,
  updateMessageContentPreviewAsync,
  updateMessageSubjectPreviewAsync,
  updateNonHostMessagePartTemplatePreviewAsync,
  useMessagesDispatch,
  useMessagesState
} from "admin/messages/MessagesContext";
import {RecipientSelection} from "admin/messages/RecipientSelection";
import MessageService, {MESSAGE_TYPE_PARTICIPANTS, MESSAGE_TYPE_TEAMS} from "shared/admin/MessageService";
import {MessagePreview} from "admin/messages/MessagePreview";
import {PARTICIPANT_MESSAGE_VALIDATION_SCHEMA, TEAM_MESSAGE_VALIDATION_SCHEMA} from "shared/admin/ValidationSchemas";
import useHttpErrorHandler from "common/HttpErrorHandlerHook";
import {enhanceMessageObjectWithCustomSelectedRecipients} from "./MessagesContext";
import {Helmet} from "react-helmet-async";

const TeamMessages = ({adminId}) => {
  const {t} = useTranslation(['admin']);
  const exampleMessage = MessageService.getExampleTeamMessage();
  const templates = ['{firstname}', '{lastname}', '{meal}', '{mealtime}', '{host}', '{partner}', '{managehostlink}'];
  return (
      <MessagesProvider messageType={MESSAGE_TYPE_TEAMS}>
        <MessagesFetchData adminId={adminId}>
          <MessagesView adminId={adminId} exampleMessage={exampleMessage} validationSchema={TEAM_MESSAGE_VALIDATION_SCHEMA} templates={templates}/>
        </MessagesFetchData>
        <Helmet>
          <title>{t('admin:mails_send_teams_title')}</title>
        </Helmet>
      </MessagesProvider>
  );
};

const ParticipantMessages = ({adminId}) => {
  const {t} = useTranslation(['admin']);
  const exampleMessage = MessageService.getExampleParticipantMessage();
  const templates = ['{firstname}', '{lastname}'];
  return (
      <MessagesProvider messageType={MESSAGE_TYPE_PARTICIPANTS}>
        <MessagesFetchData adminId={adminId}>
          <MessagesView adminId={adminId} exampleMessage={exampleMessage} validationSchema={PARTICIPANT_MESSAGE_VALIDATION_SCHEMA} templates={templates}/>
          <Helmet>
            <title>{t('admin:mails_send_participants_title')}</title>
          </Helmet>
        </MessagesFetchData>
      </MessagesProvider>
  );
};

function MessagesView({adminId, exampleMessage, validationSchema, templates}) {

  const {t} = useTranslation(['admin', 'common']);

  const {handleFormValidationErrors, validationErrors} = useHttpErrorHandler();

  const {loadingData, messageType, customSelectedRecipients} = useMessagesState();
  const dispatch = useMessagesDispatch();

  const formMethods = useForm({
    defaultValues: exampleMessage,
    validationSchema: validationSchema,
    mode: 'onBlur'
  });
  const { handleSubmit, clearError, setError, formState } = formMethods;
  const { isSubmitting } = formState;

  const handleSendMessages = async (values) => {
    clearError();
    console.log(`SendMessages with ${JSON.stringify(values)}`);
    try {
      const messageObj = enhanceMessageObjectWithCustomSelectedRecipients(values, messageType, customSelectedRecipients);
      const newMessageJob = await MessageService.sendMessagesAsync(adminId, messageObj, messageType, false);
      dispatch(newAction(ADD_MESSAGEJOB, newMessageJob));
    } catch(e) {
      handleFormValidationErrors(e);
      setError(validationErrors);
    }
  };

  const handleMessageContentChange = content => updateMessageContentPreviewAsync(content, dispatch);
  const handleMessageSubjectChange = subject => updateMessageSubjectPreviewAsync(subject, dispatch);
  const handleNonHostMessagePartTemplateChange = changedValue => updateNonHostMessagePartTemplatePreviewAsync(changedValue, dispatch);
  const handleHostMessagePartTemplateChange = changedValue => updateHostMessagePartTemplatePreviewAsync(changedValue, dispatch);

  if (loadingData) {
    return <LinearProgress color="secondary" />;
  }

  return (
      <>
        <Grid container>
          <Grid item xs={12}>
            { messageType === MESSAGE_TYPE_TEAMS && <PageTitle>{t('admin:mails_team_sendmessage_headline')}</PageTitle> }
            { messageType === MESSAGE_TYPE_PARTICIPANTS && <PageTitle>{t('admin:mails_participant_sendmessage_headline')}</PageTitle> }
          </Grid>
        </Grid>

        <FormContext {...formMethods}>
          <form>

            <Grid container spacing={3}>

              <Grid item xs={12} lg={7}>
                <Paper elevation={3}>
                  <Box p={2}>
                    <Grid container>
                      <Grid item xs={12}><MessageHeadline /></Grid>
                      <Grid item xs={12}>
                        <RecipientSelection />
                        <MessageSubject onMessageSubjectChange={handleMessageSubjectChange}/>
                        <MessageContent templates={templates}
                                        onMessageContentChange={handleMessageContentChange}
                                        rows={15}
                                        name="message"
                                        label={t('common:content')}/>
                      </Grid>
                      { messageType === MESSAGE_TYPE_TEAMS &&
                        <Grid container spacing={1}>
                          <Grid item xs={12} md={6}>
                            <MessageContent templates={[]}
                                            onMessageContentChange={handleHostMessagePartTemplateChange}
                                            rows={5}
                                            name="hostMessagePartTemplate"
                                            helperText={t('admin:mails_template_replacement_host')}
                                            label={t('admin:mails_sendteams_host')}/>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <MessageContent templates={[]}
                                            onMessageContentChange={handleNonHostMessagePartTemplateChange}
                                            rows={5}
                                            name="nonHostMessagePartTemplate"
                                            helperText={t('admin:mails_template_replacement_nonhost')}
                                            label={t('admin:mails_sendteams_nonhost')}/>
                          </Grid>
                        </Grid> }
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
                  <MessageJobsOverview adminId={adminId} />
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
  TeamMessages,
  ParticipantMessages
};
