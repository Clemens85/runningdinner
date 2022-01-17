import {Box, Grid, Paper, useMediaQuery, useTheme} from "@material-ui/core";
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
  DINNERROUTE_MESSAGE_VALIDATION_SCHEMA,
  fetchInitialMessageData, findEntityById,
  getExampleDinnerRouteMessage,
  getExampleParticipantMessage,
  getExampleTeamMessage,
  getRecipientsSelector,
  isArrayNotEmpty,
  MessageType,
  PARTICIPANT_MESSAGE_VALIDATION_SCHEMA,
  sendMessages,
  setCustomSelectedRecipients,
  TEAM_MESSAGE_VALIDATION_SCHEMA,
  updateDinnerRouteHostsPartTemplatePreviewAsync,
  updateDinnerRouteSelfPartTemplatePreviewAsync,
  updateHostMessagePartTemplatePreviewAsync,
  updateMessageContentPreviewAsync,
  updateMessageSubjectPreviewAsync,
  updateNonHostMessagePartTemplatePreviewAsync,
  useAdminDispatch,
  useAdminSelector,
  useBackendIssueHandler,
  CONSTANTS,
  recalculatePreviewMessages,
  setupInitialMessageType
} from "@runningdinner/shared";
import {useNotificationHttpError} from "../../common/NotificationHttpErrorHook";
import {BrowserTitle} from "../../common/mainnavigation/BrowserTitle";
import {useMessagesQueryHandler} from "./MessagesQueryHandlerHook";
import {FetchStatus} from "@runningdinner/shared/src/redux";
import { useCustomSnackbar } from "../../common/theme/CustomSnackbarHook";

export function TeamMessages({adminId}: BaseAdminIdProps) {
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
      <BrowserTitle titleI18nKey={"admin:mails_send_teams_title"} namespaces={"admin"} />
    </>
  );
}


export function DinnerRouteMessages({adminId}: BaseAdminIdProps) {

  const templates = ['{firstname}', '{lastname}', '{route}', '{routelink}'];

  const dispatch = useAdminDispatch();
  useEffect(() => {
    dispatch(fetchInitialMessageData(adminId, MessageType.MESSAGE_TYPE_DINNERROUTE))
  }, [dispatch, adminId]);

  return (
    <>
      <MessagesView adminId={adminId}
                    exampleMessage={getExampleDinnerRouteMessage()}
                    validationSchema={DINNERROUTE_MESSAGE_VALIDATION_SCHEMA}
                    templates={templates}
                    messageType={MessageType.MESSAGE_TYPE_DINNERROUTE}/>
      <BrowserTitle titleI18nKey={"admin:mails_send_dinnerroutes_title"} namespaces={"admin"} />
    </>
  );
}


export function ParticipantMessages({adminId}: BaseAdminIdProps) {
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
      <BrowserTitle titleI18nKey={"admin:mails_send_participants_title"} namespaces={"admin"} />
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
  const {showSuccess} = useCustomSnackbar();

  const theme = useTheme();
  const isMdDeviceOrUp = useMediaQuery(theme.breakpoints.up('md'));

  const {applyValidationIssuesToForm, getIssuesTranslated} = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: 'admin'
    }
  });
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  const dispatch = useAdminDispatch();
  const {recipients} = useAdminSelector(getRecipientsSelector);

  const {headline, selectedTeamIds, preselectAllRecipients} = useMessagesQueryHandler(messageType);

  const formMethods = useForm({
    // @ts-ignore
    defaultValues: exampleMessage,
    // resolver: yupResolver(validationSchema), // Currently I use only backend validation...
    mode: 'onBlur'
  });
  const { handleSubmit, clearErrors, setError, formState, setValue } = formMethods;
  const { isSubmitting } = formState;

  useEffect(() => {
    // Reset all our selection values on mounting this component:
     // @ts-ignore We get the correct field name...:
    setValue(getRecipientFormFieldName(messageType), "");
    dispatch(setupInitialMessageType({adminId, messageType}));
    // dispatch(setCustomSelectedRecipients([]));
    // dispatch(recalculatePreviewMessages());
  }, [dispatch, messageType, adminId, setValue]);

  useEffect(() => {
    if (messageType !== MessageType.MESSAGE_TYPE_PARTICIPANTS && isArrayNotEmpty(selectedTeamIds) && recipients.fetchStatus === FetchStatus.SUCCEEDED) {
      const preSelectedTeams = selectedTeamIds
                                .map(id => findEntityById(recipients.data, id))
                                .filter(elem => elem);
      // @ts-ignore When running in this case, we have always teamSelection
      setValue("teamSelection", CONSTANTS.RECIPIENT_SELECTION_COMMON.CUSTOM_SELECTION);
      dispatch(setCustomSelectedRecipients(preSelectedTeams));
    } 
    // else if (recipients.fetchStatus === FetchStatus.SUCCEEDED && isArrayEmpty(selectedTeamIds)) {
    //   dispatch(setCustomSelectedRecipients([]));
    // } 
    else if (preselectAllRecipients && recipients.fetchStatus === FetchStatus.SUCCEEDED) {
      // @ts-ignore We get the correct field name...:
      setValue(getRecipientFormFieldName(messageType), CONSTANTS.RECIPIENT_SELECTION_COMMON.ALL);
    }
    // eslint-disable-next-line
  }, [JSON.stringify(selectedTeamIds), messageType, recipients.fetchStatus, preselectAllRecipients, setValue]);


  const handleSendMessages = async (values: T) => {
    clearErrors();
    try {
      const sendMessagesPromise = dispatch(sendMessages(values)).unwrap();
      window.scrollTo(0, 0);
      showSuccess(t("admin:mails_sending_submitted"));
      await sendMessagesPromise;
    } catch(e) {
      applyValidationIssuesToForm(e, setError);
      showHttpErrorDefaultNotification(e);
    }
  };

  function getRecipientFormFieldName(messageType: MessageType) {
    return messageType !== MessageType.MESSAGE_TYPE_PARTICIPANTS ? "teamSelection" : "participantSelection";
  }

  const handleMessageContentChange = (content: string) => updateMessageContentPreviewAsync(content);
  const handleMessageSubjectChange = (subject: string) => updateMessageSubjectPreviewAsync(subject);
  const handleNonHostMessagePartTemplateChange = (changedValue: string) => updateNonHostMessagePartTemplatePreviewAsync(changedValue);
  const handleHostMessagePartTemplateChange = (changedValue: string) => updateHostMessagePartTemplatePreviewAsync(changedValue);
  const handleDinnerRouteHostsPartTemplateChange = (changedValue: string) => updateDinnerRouteHostsPartTemplatePreviewAsync(changedValue);
  const handleDinnerRouteSelfPartTemplateChange = (changedValue: string) => updateDinnerRouteSelfPartTemplatePreviewAsync(changedValue);

  // @ts-ignore
  return (
      <>
        <Grid container>
          <Grid item xs={12}><PageTitle>{t(headline)}</PageTitle></Grid>
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
                                        showTemplatesHelpIcon={true}
                                        name="message"
                                        label={t('common:content')}/>
                      </Grid>
                      { messageType === MessageType.MESSAGE_TYPE_TEAMS &&
                        <Grid container spacing={1}>
                          <Grid item xs={12} md={6}>
                            <MessageContent templates={[]}
                                            onMessageContentChange={handleHostMessagePartTemplateChange}
                                            rows={5}
                                            showTemplatesHelpIcon={true}
                                            name="hostMessagePartTemplate"
                                            helperText={t('admin:mails_template_replacement_host')}
                                            label={t('admin:mails_sendteams_host')}/>
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <MessageContent templates={[]}
                                            onMessageContentChange={handleNonHostMessagePartTemplateChange}
                                            rows={5}
                                            showTemplatesHelpIcon={true}
                                            name="nonHostMessagePartTemplate"
                                            helperText={t('admin:mails_template_replacement_nonhost')}
                                            label={t('admin:mails_sendteams_nonhost')}/>
                          </Grid>
                        </Grid> }

                        { messageType === MessageType.MESSAGE_TYPE_DINNERROUTE &&
                        <Grid container spacing={1}>
                          <Grid item xs={12} lg={6}>
                            <MessageContent templates={['{firstname}', '{lastname}', '{meal}', '{mealtime}', '{mealspecifics}']}
                                            onMessageContentChange={handleDinnerRouteSelfPartTemplateChange}
                                            rows={7}
                                            showTemplatesHelpIcon={isMdDeviceOrUp}
                                            name="selfTemplate"
                                            helperText={t('admin:mails_template_replacement_route_host')}
                                            label={t('admin:mails_senddinnerroute_self')}/>
                          </Grid>
                          <Grid item xs={12} lg={6}>
                            <MessageContent templates={['{firstname}', '{lastname}', '{meal}', '{mealtime}', '{hostaddress}']}
                                            onMessageContentChange={handleDinnerRouteHostsPartTemplateChange}
                                            rows={7}
                                            showTemplatesHelpIcon={isMdDeviceOrUp}
                                            name="hostsTemplate"
                                            helperText={t('admin:mails_template_replacement_route_guest')}
                                            label={t('admin:mails_senddinnerroute_hosts')}/>
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
