import {Box, Grid, Paper} from "@material-ui/core";
import {PageTitle} from "../../common/theme/typography/Tags";
import {FormProvider, useForm} from "react-hook-form";
import React, {useEffect} from "react";
import {useTranslation} from "react-i18next";
import {MessageJobsOverview} from "./messagejobs/MessageJobsOverview";
import MessageHeadline from "./MessageHeadline";
import {PrimaryButton} from "../../common/theme/PrimaryButton";
import MessageSubject from "./MessageSubject";
import MessageContent from "./MessageContent";
import {RecipientSelection} from "./RecipientSelection";
import {MessagePreview} from "./MessagePreview";
import {
  BaseAdminIdProps,
  BaseMessage,
  fetchInitialMessageData,
  getExampleParticipantMessage,
  getExampleTeamMessage,
  MessageType,
  PARTICIPANT_MESSAGE_VALIDATION_SCHEMA,
  sendMessages,
  TEAM_MESSAGE_VALIDATION_SCHEMA,
  updateHostMessagePartTemplatePreviewAsync,
  updateMessageContentPreviewAsync,
  updateMessageSubjectPreviewAsync,
  updateNonHostMessagePartTemplatePreviewAsync,
  useBackendIssueHandler,
  useAdminDispatch
} from "@runningdinner/shared";
import {Helmet} from "react-helmet-async";
import {useNotificationHttpError} from "../../common/NotificationHttpErrorHook";

export function TeamMessages({adminId}: BaseAdminIdProps) {
  const {t} = useTranslation(['admin']);
  const templates = ['{firstname}', '{lastname}', '{meal}', '{mealtime}', '{host}', '{partner}', '{managehostlink}'];

  const dispatch = useAdminDispatch();
  useEffect(() => {
    dispatch(fetchInitialMessageData(adminId, MessageType.MESSAGE_TYPE_TEAMS))
  }, [dispatch, adminId]);

  return (
    <>
      <MessagesView adminId={adminId}
                    exampleMessage={getExampleTeamMessage()}
                    validationSchema={TEAM_MESSAGE_VALIDATION_SCHEMA}
                    templates={templates}
                    messageType={MessageType.MESSAGE_TYPE_TEAMS}/>
      <Helmet>
        <title>{t('admin:mails_send_teams_title')}</title>
      </Helmet>
    </>
  );
}

export function ParticipantMessages({adminId}: BaseAdminIdProps) {
  const {t} = useTranslation(['admin']);
  const templates = ['{firstname}', '{lastname}'];

  const dispatch = useAdminDispatch();
  useEffect(() => {
    dispatch(fetchInitialMessageData(adminId, MessageType.MESSAGE_TYPE_PARTICIPANTS))
  }, [dispatch, adminId]);

  return (
    <>
      <MessagesView adminId={adminId}
                    exampleMessage={getExampleParticipantMessage()}
                    validationSchema={PARTICIPANT_MESSAGE_VALIDATION_SCHEMA}
                    templates={templates}
                    messageType={MessageType.MESSAGE_TYPE_PARTICIPANTS} />
      <Helmet>
        <title>{t('admin:mails_send_participants_title')}</title>
      </Helmet>
    </>
  );
}

interface MessagesViewProps<T extends BaseMessage> extends BaseAdminIdProps {
  exampleMessage: T;
  validationSchema?: any;
  templates: string[];
  messageType: MessageType
}

function MessagesView<T extends BaseMessage>({adminId, exampleMessage, templates, messageType}: MessagesViewProps<T>) {

  const {t} = useTranslation(['admin', 'common']);

  const {applyValidationIssuesToForm, getIssuesTranslated} = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: 'admin'
    }
  });
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  const dispatch = useAdminDispatch();

  const formMethods = useForm({
    // @ts-ignore
    defaultValues: exampleMessage,
    // resolver: yupResolver(validationSchema), // Currently I use only backend validation...
    mode: 'onBlur'
  });
  const { handleSubmit, clearErrors, setError, formState } = formMethods;
  const { isSubmitting } = formState;

  const handleSendMessages = async (values: T) => {
    clearErrors();
    try {
      await dispatch(sendMessages(values))
              .unwrap();
    } catch(e) {
      applyValidationIssuesToForm(e, setError);
      showHttpErrorDefaultNotification(e);
    }
  };

  const handleMessageContentChange = (content: string) => updateMessageContentPreviewAsync(content);
  const handleMessageSubjectChange = (subject: string) => updateMessageSubjectPreviewAsync(subject);
  const handleNonHostMessagePartTemplateChange = (changedValue: string) => updateNonHostMessagePartTemplatePreviewAsync(changedValue);
  const handleHostMessagePartTemplateChange = (changedValue: string) => updateHostMessagePartTemplatePreviewAsync(changedValue);

  // @ts-ignore
  return (
      <>
        <Grid container>
          <Grid item xs={12}>
            { messageType === MessageType.MESSAGE_TYPE_TEAMS && <PageTitle>{t('admin:mails_team_sendmessage_headline')}</PageTitle> }
            { messageType === MessageType.MESSAGE_TYPE_PARTICIPANTS && <PageTitle>{t('admin:mails_participant_sendmessage_headline')}</PageTitle> }
          </Grid>
        </Grid>

        <FormProvider {...formMethods}>
          <form>

            <Grid container spacing={3}>

              <Grid item xs={12} lg={7}>
                <Paper elevation={3}>
                  <Box p={2}>
                    <Grid container>
                      <Grid item xs={12}><MessageHeadline /></Grid>
                      <Grid item xs={12}>
                        <RecipientSelection messageType={messageType} adminId={adminId} />
                        <MessageSubject onMessageSubjectChange={handleMessageSubjectChange}/>
                        <MessageContent templates={templates}
                                        onMessageContentChange={handleMessageContentChange}
                                        rows={15}
                                        name="message"
                                        label={t('common:content')}/>
                      </Grid>
                      { messageType === MessageType.MESSAGE_TYPE_TEAMS &&
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
                            {/* @ts-ignore */}
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
                  <MessageJobsOverview adminId={adminId} messageType={messageType} />
                </Grid>
                <Grid item xs={12}>
                  <Box mt={3}>
                    <Paper elevation={3}>
                      <Box p={2}>
                        <MessagePreview adminId={adminId} messageType={messageType} />
                      </Box>
                    </Paper>
                  </Box>
                </Grid>
              </Grid>

            </Grid>

          </form>
        </FormProvider>
      </>
  );
}
