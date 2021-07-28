import React, {useEffect, useState} from 'react';
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
  CONSTANTS, formatLocalDateWithSeconds, isStringNotEmpty, CallbackHandler,
} from "@runningdinner/shared";
import {useParams} from "react-router-dom";
import {useAdminDispatch} from "@runningdinner/shared/src/admin/redux/AdminStoreDefinitions";
import {
  getMessageJobDetailsSelector,
  getMessageTasksSelector
} from "@runningdinner/shared/src/admin/redux/MessageJobDetailsSlice";
import {Helmet} from "react-helmet-async";
import {PageTitle, Subtitle} from "../../../common/theme/typography/Tags";
import {
  Box,
  Grid,
  Hidden,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from "@material-ui/core";
import {BackToListButton, useMasterDetailView} from "../../../common/hooks/MasterDetailViewHook";
import {useTranslation} from "react-i18next";
import toLower from "lodash/toLower";
import {HelpIconTooltip} from "../../../common/theme/HelpIconTooltip";
import Paragraph from "../../../common/theme/typography/Paragraph";
import useCommonStyles from "../../../common/theme/CommonStyles";
import {MessageJobStatus} from "./MessageJobStatus";
import {EmptyDetails} from "../../common/EmptyDetails";
import FormFieldset from "../../../common/theme/FormFieldset";
import get from 'lodash/get';
import {MessageContentView} from "./MessageContentView";
import {SecondaryButtonAsync} from "../../../common/theme/SecondaryButtonAsync";

export function MessageJobDetailsList({runningDinner}: BaseRunningDinnerProps) {

  const params = useParams<Record<string, string>>();
  const messageJobId = params.messageJobId;
  const {adminId} = runningDinner;

  const dispatch = useAdminDispatch();
  const {data: messageJob} = useAdminSelector(getMessageJobDetailsSelector);
  const {data: messageTasks} = useAdminSelector(getMessageTasksSelector);

  useEffect(() => {
    dispatch(fetchMessageJobDetailsData(adminId, messageJobId));
  }, [messageJobId, adminId, dispatch]);

  if (messageJob && isArrayNotEmpty(messageTasks)) {
    return <MessageJobDetailsListView messageTasks={messageTasks as MessageTask[]} messageJob={messageJob}/>;
  }
  return null;
}

export interface MessageJobDetailsListViewProps {
  messageJob: MessageJob;
  messageTasks: MessageTask[];
}

function MessageJobDetailsListView({messageTasks, messageJob}: MessageJobDetailsListViewProps) {

  const {showBackToListViewButton, setShowDetailsView, showListView, showDetailsView} = useMasterDetailView();
  const {t} = useTranslation(['admin', 'common']);

  const [selectedMessageTask, setSelectedMessageTask] = useState<MessageTask>();

  const messageTypeI18nKey = toLower("messagejob_type_" + messageJob.messageType);

  function handleSelectMessageTask(messageTask: MessageTask) {
    setSelectedMessageTask(messageTask);
    setShowDetailsView(true);
    window.scrollTo(0, 0);
  }

  function handleReSendMessageTask(messageTask: MessageTask) {

  }

  return (
    <div>
      <PageTitle>
        {t('admin:protocols_transfer_headline_prefix')} {t(messageTypeI18nKey)}
      </PageTitle>
      <Box mt={-1} mb={2}>
        <Grid container alignItems={"baseline"}>
          <Grid item>
            <Subtitle gutterBottom={false}>
              <LocalDate date={messageJob.createdAt} /> {t('common:at_time')} <Time date={messageJob.createdAt} includeSeconds={true} />
            </Subtitle>
          </Grid>
          <Grid item>
            <Box ml={1}><HelpIconTooltip title={<Paragraph i18n={"admin:synchronize_messagejobs_help"} />} fontSize={"small"} /></Box>
          </Grid>
        </Grid>
      </Box>
      <Grid container spacing={2}>
        { showListView &&
          <Grid item xs={12} md={8}>
            <MessageTasksTable messageTasks={messageTasks}
                               onSelectMessageTask={handleSelectMessageTask}
                               selectedMessageTask={selectedMessageTask}/>
          </Grid>
        }
        <Grid item xs={12} md={4}>
          { showDetailsView && selectedMessageTask ?
            <>
              { showBackToListViewButton && <BackToListButton onBackToList={() => setShowDetailsView(false)} />}
              { <MessageTaskDetailsView messageTask={selectedMessageTask}
                                                     onReSendMessageTask={() => handleReSendMessageTask(selectedMessageTask)} /> }
            </> :
            <EmptyDetails labelI18n={"message_tasks_no_selection"} />
          }
        </Grid>
      </Grid>
      <Helmet>
        <title>{t('admin:mail_protocols')}</title>
      </Helmet>
    </div>
  );
}

interface MessageTasksTableProps extends Omit<MessageJobDetailsListViewProps, "messageJob"> {
  selectedMessageTask?: MessageTask;
  onSelectMessageTask: (messageTask: MessageTask) => unknown;
}

function MessageTasksTable({messageTasks, onSelectMessageTask, selectedMessageTask}: MessageTasksTableProps) {

  const {t} = useTranslation(['admin', 'common']);

  const classes = useCommonStyles();

  function messageTaskTableRow(messageTask: MessageTask) {
    return (
      <TableRow key={messageTask.id} hover className={classes.cursorPointer}
                onClick={() => onSelectMessageTask(messageTask)}
                selected={isSameEntity(messageTask, selectedMessageTask)}>
        <TableCell><MessageJobStatus messageJobOrTask={messageTask} /></TableCell>
        <TableCell>{messageTask.recipientEmail}</TableCell>
        <TableCell>{formatLocalDateWithSeconds(messageTask.sendingStartTime)}</TableCell>
        <TableCell>{formatLocalDateWithSeconds(messageTask.sendingEndTime)}</TableCell>
        <Hidden xsDown>
          <TableCell><MessageContentView messageTask={messageTask} truncateMessageContentToNumChars={48} /></TableCell>
        </Hidden>
      </TableRow>
    );
  }
  return (
    <TableContainer component={Paper}>
      <Table size={"small"}>
        <TableHead>
          <TableRow>
            <TableCell>Status</TableCell>
            <TableCell>{t('common:recipient')}</TableCell>
            <TableCell>{t('admin:sending_started_at_text')}</TableCell>
            <TableCell>{t('admin:sending_finished_at_text')}</TableCell>
            <Hidden xsDown>
              <TableCell>{t('common:content')}</TableCell>
            </Hidden>
          </TableRow>
        </TableHead>
        <TableBody>
          { messageTasks.map(messageTask => messageTaskTableRow(messageTask)) }
        </TableBody>
      </Table>
    </TableContainer>
  );
}

interface MessageTaskDetailsViewProps {
  messageTask: MessageTask;
  onReSendMessageTask: CallbackHandler;
}

function MessageTaskDetailsView({messageTask, onReSendMessageTask}: MessageTaskDetailsViewProps) {

  const {t} = useTranslation(['admin', 'common']);

  const statusResult = getStatusResult(messageTask);

  const sendingFinishedWithFailure = statusResult === CONSTANTS.SENDING_STATUS_RESULT.SENDING_FINISHED_FAILURE;

  const failureReportMessage = sendingFinishedWithFailure ? get(messageTask, "sendingResult.failureMessage") : undefined;
  const failureDate = sendingFinishedWithFailure ? get(messageTask, "sendingResult.delieveryFailedDate") : undefined;
  const failureDateFormatted = failureDate ? formatLocalDateWithSeconds(failureDate) : undefined;
  const failureTypeMessage = sendingFinishedWithFailure ? t("FAILURE_TYPE_" + get(messageTask, "sendingResult.failureType", "UNKNOWN")) : undefined;

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
              { isStringNotEmpty(failureTypeMessage) && <MessageTaskDetailsRow label={t("common:failure")} value={failureTypeMessage}/> }
              { isStringNotEmpty(failureReportMessage) && sendingFinishedWithFailure && <MessageTaskDetailsRow label={t("common:error_report")} value={failureReportMessage}/> }
              <MessageTaskDetailsRow label={t("admin:sending_started_at_text")} value={formatLocalDateWithSeconds(messageTask.sendingStartTime)!} />
              <MessageTaskDetailsRow label={t("admin:sending_finished_at_text")} value={formatLocalDateWithSeconds(messageTask.sendingEndTime)!} />
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
          <Grid container justify={"flex-end"}>
            <Grid item>
              <SecondaryButtonAsync onClick={onReSendMessageTask} color="primary" variant={"outlined"} size={"small"}>
                {t('admin:send_again')}...
              </SecondaryButtonAsync>
            </Grid>
          </Grid>
        </Box>

      </Box>
    </Paper>
  );
}

function MessageTaskDetailsRow({label, value}: LabelValue) {
  return (
    <Grid container justify={"space-between"}>
      <Grid item>
        <span>{label}</span>
      </Grid>
      <Grid item>
        <strong>{value}</strong>
      </Grid>
    </Grid>
  );
}