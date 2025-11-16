import { useEffect, useState } from 'react';
import {
  BaseRunningDinnerProps,
  fetchMessageJobDetailsData,
  isArrayNotEmpty,
  LocalDate,
  Time,
  MessageJob,
  MessageTask,
  useAdminSelector,
  isSameEntity,
  LabelValue,
  getStatusResult,
  CONSTANTS,
  formatLocalDateWithSeconds,
  isStringNotEmpty,
  CallbackHandler,
  getTruncatedText,
  useDisclosure,
  useBackendIssueHandler,
  reSendMessageTaskAsync,
  Message,
  NoopFunction,
  useAdminDispatch,
  HttpError,
} from '@runningdinner/shared';
import { useParams } from 'react-router-dom';
import { getMessageJobDetailsSelector, getMessageTasksSelector } from '@runningdinner/shared/src/admin/redux/MessageJobDetailsSlice';
import { PageTitle, Span, Subtitle } from '../../../common/theme/typography/Tags';
import { Box, Dialog, DialogContent, Grid, Hidden, LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { BackToListButton, useMasterDetailView } from '../../../common/hooks/MasterDetailViewHook';
import { useTranslation } from 'react-i18next';
import { cloneDeep } from 'lodash-es';
import { HelpIconTooltip } from '../../../common/theme/HelpIconTooltip';
import Paragraph from '../../../common/theme/typography/Paragraph';
import { TableRowWithCursor } from '../../../common/theme/CommonStyles';
import { MessageJobStatus } from './MessageJobStatus';
import { EmptyDetails } from '../../common/EmptyDetails';
import FormFieldset from '../../../common/theme/FormFieldset';
import { get, toLower } from 'lodash-es';
import { MessageContentView } from './MessageContentView';
import { SecondaryButtonAsync } from '../../../common/theme/SecondaryButtonAsync';
import { DialogTitleCloseable } from '../../../common/theme/DialogTitleCloseable';
import DialogActionsPanel from '../../../common/theme/DialogActionsPanel';
import { useCustomSnackbar } from '../../../common/theme/CustomSnackbarHook';
import { useNotificationHttpError } from '../../../common/NotificationHttpErrorHook';
import { useForm, FormProvider } from 'react-hook-form';
import MessageSubject from '../MessageSubject';
import MessageContent from '../MessageContent';
import FormTextField from '../../../common/input/FormTextField';
import { BrowserTitle } from '../../../common/mainnavigation/BrowserTitle';

export function MessageJobDetailsList({ runningDinner }: BaseRunningDinnerProps) {
  const params = useParams<Record<string, string>>();
  const messageJobId = params.messageJobId || '';
  const { adminId } = runningDinner;

  const dispatch = useAdminDispatch();
  const { data: messageJob } = useAdminSelector(getMessageJobDetailsSelector);
  const { data: messageTasks } = useAdminSelector(getMessageTasksSelector);

  useEffect(() => {
    dispatch(fetchMessageJobDetailsData(adminId, messageJobId));
  }, [messageJobId, adminId, dispatch]);

  if (messageJob && isArrayNotEmpty(messageTasks)) {
    return (
      <MessageJobDetailsListView
        messageTasks={messageTasks as MessageTask[]}
        messageJob={messageJob}
        triggerReload={() => dispatch(fetchMessageJobDetailsData(adminId, messageJobId))}
      />
    );
  }
  return null;
}

export interface MessageJobDetailsListViewProps {
  messageJob: MessageJob;
  messageTasks: MessageTask[];
  triggerReload: CallbackHandler;
}

function MessageJobDetailsListView({ messageTasks, messageJob, triggerReload }: MessageJobDetailsListViewProps) {
  const { showBackToListViewButton, setShowDetailsView, showListView, showDetailsView } = useMasterDetailView();
  const { t } = useTranslation(['admin', 'common']);

  const [selectedMessageTask, setSelectedMessageTask] = useState<MessageTask>();
  const { isOpen: isReSendMessageTaskDialogOpen, open: openReSendMessageTaskDialog, close: closeReSendMessageTaskDialog } = useDisclosure();

  const messageTypeI18nKey = toLower('messagejob_type_' + messageJob.messageType);

  function handleSelectMessageTask(messageTask: MessageTask) {
    setSelectedMessageTask(messageTask);
    setShowDetailsView(true);
    window.scrollTo(0, 0);
  }

  function handleReSendMessageTaskDialogClosed(messageResent?: boolean) {
    closeReSendMessageTaskDialog();
    if (messageResent) {
      setShowDetailsView(false);
      setSelectedMessageTask(undefined);
      triggerReload();
    }
  }

  return (
    <div>
      <PageTitle>
        {t('admin:protocols_transfer_headline_prefix')} {t(messageTypeI18nKey)}
      </PageTitle>
      <Box mt={-1} mb={2}>
        <Grid container alignItems={'baseline'}>
          <Grid item>
            <Subtitle gutterBottom={false}>
              <LocalDate date={messageJob.createdAt} /> {t('common:at_time')} <Time date={messageJob.createdAt} includeSeconds={true} />
            </Subtitle>
          </Grid>
          <Grid item>
            <Box ml={1}>
              <HelpIconTooltip title={<Paragraph i18n={'admin:synchronize_messagejobs_help'} />} fontSize={'small'} />
            </Box>
          </Grid>
        </Grid>
      </Box>
      <Grid container spacing={2}>
        {showListView && (
          <Grid item xs={12} md={8}>
            <MessageTasksTable messageTasks={messageTasks} onSelectMessageTask={handleSelectMessageTask} selectedMessageTask={selectedMessageTask} />
          </Grid>
        )}
        <Grid item xs={12} md={4}>
          {showDetailsView && selectedMessageTask ? (
            <>
              {showBackToListViewButton && <BackToListButton onBackToList={() => setShowDetailsView(false)} />}
              {<MessageTaskDetailsView messageTask={selectedMessageTask} onReSendMessageTask={() => openReSendMessageTaskDialog(selectedMessageTask)} />}
            </>
          ) : (
            <EmptyDetails labelI18n={'message_tasks_no_selection'} />
          )}
        </Grid>
      </Grid>
      {isReSendMessageTaskDialogOpen && selectedMessageTask && <ReSendMessageTaskDialog messageTask={selectedMessageTask} onClose={handleReSendMessageTaskDialogClosed} />}
      <BrowserTitle titleI18nKey={'admin:mail_protocols'} namespaces={'admin'} />
    </div>
  );
}

interface MessageTasksTableProps extends Omit<MessageJobDetailsListViewProps, 'messageJob' | 'triggerReload'> {
  selectedMessageTask?: MessageTask;
  onSelectMessageTask: (messageTask: MessageTask) => unknown;
}

function MessageTasksTable({ messageTasks, onSelectMessageTask, selectedMessageTask }: MessageTasksTableProps) {
  const { t } = useTranslation(['admin', 'common']);

  function messageTaskTableRow(messageTask: MessageTask) {
    return (
      <TableRowWithCursor key={messageTask.id} hover onClick={() => onSelectMessageTask(messageTask)} selected={isSameEntity(messageTask, selectedMessageTask)}>
        <Hidden smDown>
          <TableCell>
            <MessageJobStatus messageJobOrTask={messageTask} />
          </TableCell>
          <TableCell>{messageTask.recipientEmail}</TableCell>
        </Hidden>
        <Hidden smUp>
          <TableCell>
            <div style={{ display: 'flex', alignContent: 'center' }}>
              <div style={{ marginRight: '4px' }}>
                <MessageJobStatus messageJobOrTask={messageTask} />
              </div>
              <div>{getTruncatedText(messageTask.recipientEmail, 18)}</div>
            </div>
          </TableCell>
        </Hidden>
        <TableCell>{formatLocalDateWithSeconds(messageTask.sendingStartTime)}</TableCell>
        <Hidden smDown>
          <TableCell>{formatLocalDateWithSeconds(messageTask.sendingEndTime)}</TableCell>
        </Hidden>
        <Hidden smDown>
          <TableCell>
            <MessageContentView messageTask={messageTask} truncateMessageContentToNumChars={48} />
          </TableCell>
        </Hidden>
      </TableRowWithCursor>
    );
  }
  return (
    <TableContainer component={Paper}>
      <Table size={'small'}>
        <TableHead>
          <TableRow>
            <Hidden smDown>
              <TableCell>Status</TableCell>
              <TableCell>{t('common:recipient')}</TableCell>
            </Hidden>
            <Hidden smUp>
              <TableCell>&nbsp;</TableCell>
            </Hidden>
            <TableCell>{t('admin:sending_started_at_text')}</TableCell>
            <Hidden smDown>
              <TableCell>{t('admin:sending_finished_at_text')}</TableCell>
            </Hidden>
            <Hidden smDown>
              <TableCell>{t('common:content')}</TableCell>
            </Hidden>
          </TableRow>
        </TableHead>
        <TableBody>{messageTasks.map((messageTask) => messageTaskTableRow(messageTask))}</TableBody>
      </Table>
    </TableContainer>
  );
}

interface MessageTaskDetailsViewProps {
  messageTask: MessageTask;
  onReSendMessageTask: CallbackHandler;
}

function MessageTaskDetailsView({ messageTask, onReSendMessageTask }: MessageTaskDetailsViewProps) {
  const { t } = useTranslation(['admin', 'common']);

  const statusResult = getStatusResult(messageTask);

  const sendingFinishedWithFailure = statusResult === CONSTANTS.SENDING_STATUS_RESULT.SENDING_FINISHED_FAILURE;

  const failureReportMessage = sendingFinishedWithFailure ? get(messageTask, 'sendingResult.failureMessage') : undefined;
  const failureDate = sendingFinishedWithFailure ? get(messageTask, 'sendingResult.delieveryFailedDate') : undefined;
  const failureDateFormatted = failureDate ? formatLocalDateWithSeconds(failureDate) : undefined;
  const failureTypeMessage = sendingFinishedWithFailure ? t('FAILURE_TYPE_' + get(messageTask, 'sendingResult.failureType', 'UNKNOWN')) : undefined;

  const statusResultMessage = failureDateFormatted ? t(statusResult) + ` (am ${failureDateFormatted})` : t(statusResult);

  return (
    <Paper elevation={3}>
      <Box p={2}>
        <Grid container>
          <Grid item xs={12}>
            <Subtitle>{messageTask.recipientEmail}</Subtitle>
          </Grid>
        </Grid>

        <Box mt={2}>
          <Grid container>
            <Grid item xs={12}>
              <FormFieldset>{t('admin:transfer')}</FormFieldset>
              <MessageTaskDetailsRow label="Status" value={statusResultMessage} />
              {isStringNotEmpty(failureTypeMessage) && <MessageTaskDetailsRow label={t('common:failure')} value={failureTypeMessage} />}
              {isStringNotEmpty(failureReportMessage) && sendingFinishedWithFailure && <MessageTaskDetailsRow label={t('common:error_report')} value={failureReportMessage} />}
              <MessageTaskDetailsRow label={t('admin:sending_started_at_text')} value={formatLocalDateWithSeconds(messageTask.sendingStartTime)!} />
              <MessageTaskDetailsRow label={t('admin:sending_finished_at_text')} value={formatLocalDateWithSeconds(messageTask.sendingEndTime)!} />
            </Grid>
          </Grid>
        </Box>
        <Box mt={3}>
          <Grid container>
            <Grid item xs={12}>
              <FormFieldset>{t('common:content')}</FormFieldset>
              <MessageContentView messageTask={messageTask} />
            </Grid>
          </Grid>
        </Box>
        <Box mt={2}>
          <Grid container justifyContent={'flex-end'}>
            <Grid item>
              <SecondaryButtonAsync onClick={onReSendMessageTask} color="primary" variant={'outlined'} size={'small'}>
                {t('admin:send_again')}...
              </SecondaryButtonAsync>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Paper>
  );
}

function MessageTaskDetailsRow({ label, value }: LabelValue) {
  return (
    <Grid container justifyContent={'space-between'}>
      <Grid item>
        <span>{label}</span>
      </Grid>
      <Grid item>
        <strong>{value}</strong>
      </Grid>
    </Grid>
  );
}

interface ReSendMessageTaskDialogProps {
  messageTask: MessageTask;
  onClose: (messageResent?: boolean) => unknown;
}
interface ReSendMessageTaskModel extends Message {
  recipientEmail: string;
}
function ReSendMessageTaskDialog({ messageTask, onClose }: ReSendMessageTaskDialogProps) {
  const { message: incomingMessage, recipientEmail: incomingRecipientEmail } = messageTask;

  const { t } = useTranslation(['admin', 'common']);
  const { showSuccess } = useCustomSnackbar();

  const { applyValidationIssuesToForm, getIssuesTranslated } = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: 'admin',
    },
  });
  const { showHttpErrorDefaultNotification } = useNotificationHttpError(getIssuesTranslated);

  const formMethods = useForm<ReSendMessageTaskModel>({
    defaultValues: { ...incomingMessage, recipientEmail: incomingRecipientEmail },
    mode: 'onTouched',
  });
  const { handleSubmit, clearErrors, setError, formState } = formMethods;
  const { isSubmitting } = formState;

  const handleReSendMessageTask = async (values: ReSendMessageTaskModel) => {
    const { subject, content, recipientEmail } = values;
    const messageTaskToSave = cloneDeep(messageTask);
    messageTaskToSave.recipientEmail = recipientEmail;
    messageTaskToSave.message.subject = subject;
    messageTaskToSave.message.content = content;
    clearErrors();
    try {
      await reSendMessageTaskAsync(messageTaskToSave.adminId, messageTaskToSave);
      window.scrollTo(0, 0);
      showSuccess(t('admin:message_task_resend_success'));
      onClose(true);
    } catch (e) {
      applyValidationIssuesToForm(e as HttpError, setError);
      showHttpErrorDefaultNotification(e as HttpError);
    }
  };

  return (
    <Dialog open={true} onClose={() => onClose(false)} aria-labelledby="Send mail message again" maxWidth={'lg'} fullWidth={true}>
      <FormProvider {...formMethods}>
        <form>
          <DialogTitleCloseable onClose={onClose}>{t('admin:send_again')}</DialogTitleCloseable>
          <DialogContent>
            <Span i18n={'admin:send_again_help_text'} />
            <Box mt={3}>
              <Grid container>
                <Grid item xs={12}>
                  <FormTextField name="recipientEmail" label={t('admin:recipient_email')} variant={'outlined'} fullWidth mb={2} />
                </Grid>
                <Grid item xs={12}>
                  <MessageSubject onMessageSubjectChange={NoopFunction} />
                </Grid>
                <Grid item xs={12}>
                  <MessageContent name="content" label={t('common:content')} showTemplatesHelpIcon={true} />
                </Grid>
              </Grid>
            </Box>
            {isSubmitting && <LinearProgress />}
          </DialogContent>
          <DialogActionsPanel onOk={handleSubmit(handleReSendMessageTask)} onCancel={onClose} okLabel={t('admin:send')} cancelLabel={t('common:cancel')} />
        </form>
      </FormProvider>
    </Dialog>
  );
}
