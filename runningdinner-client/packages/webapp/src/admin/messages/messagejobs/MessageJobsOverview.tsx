import React from "react";
import {Box, LinearProgress, Paper, TableCell, TableRow} from "@material-ui/core";
import {Span, Subtitle} from "../../../common/theme/typography/Tags";
import {
  formatLocalDateWithSeconds,
  getMessageJobsLastPollDate,
  getMessageJobsSelector,
  isArrayEmpty, isArrayNotEmpty,
  LocalDate,
  MessageJob,
  MessageTypeAdminIdPayload,
  queryNotFinishedMessageJobs,
  Time,
  useAdminSelector
} from "@runningdinner/shared";
import Grid from "@material-ui/core/Grid";
import {MessageJobStatus} from "./MessageJobStatus";
import Paragraph from "../../../common/theme/typography/Paragraph";
import useCommonStyles from "../../../common/theme/CommonStyles";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import {HelpIconTooltip} from "../../../common/theme/HelpIconTooltip";
import {useAdminNavigation} from "../../AdminNavigationHook";
import {useDispatch} from "react-redux";
import {FetchStatus} from "@runningdinner/shared/src/redux";

export function MessageJobsOverview({adminId, messageType}: MessageTypeAdminIdPayload) {

  const {data: messageJobs, fetchStatus: messageJobsFetchStatus} = useAdminSelector(getMessageJobsSelector);
  const lastPollDate = useAdminSelector(getMessageJobsLastPollDate);
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (messageJobsFetchStatus !== FetchStatus.LOADING && isArrayNotEmpty(messageJobs)) {
      dispatch(queryNotFinishedMessageJobs(messageJobs));
    }
  }, [messageJobs, lastPollDate, messageJobsFetchStatus, dispatch]);

  const lastPollDateFormatted = formatLocalDateWithSeconds(lastPollDate);
  const classes = useCommonStyles();

  if (!messageJobs) {
    return <LinearProgress color="secondary" />;
  }

  return (
      <Paper elevation={3}>
        <Box p={2}>
          <Box mb={2}>
            <Subtitle i18n="admin:protocols" />
          </Box>
          { isArrayEmpty(messageJobs) && <i><Span i18n="admin:protocols_empty"/></i> }
          { !isArrayEmpty(messageJobs) && <MessageJobsTable adminId={adminId} messageJobs={messageJobs}/> }
          <Box mt={2}>
            <Grid container justify="space-between">
              { !isArrayEmpty(messageJobs) &&
                <Grid item>
                  <Grid container alignItems="center" spacing={1}>
                    <Grid item><Span>Info</Span></Grid>
                    <Grid item><HelpIconTooltip title={<Paragraph i18n='admin:synchronize_messagejobs_help'/>} placement='right' /></Grid>
                  </Grid>
                </Grid> }
              <Grid item className={classes.textAlignRight}>
                <i><Span i18n="admin:protocols_last_update_text" parameters={{ lastPollDate: lastPollDateFormatted }} /></i>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>
  );
}

interface MessageJobsTableProps {
  adminId: string;
  messageJobs: MessageJob[];
}
function MessageJobsTable({adminId, messageJobs}: MessageJobsTableProps) {

  const messageJobRows = messageJobs
                          .map(messageJob => <MessageJobRow key={messageJob.id} messageJob={messageJob} adminId={adminId}/>);

  return (
      <TableContainer>
        <Table size={"small"}>
          <TableBody>
            { messageJobRows }
          </TableBody>
        </Table>
      </TableContainer>
  );
}

interface MessageJobRowProps {
  adminId: string;
  messageJob: MessageJob;
}
function MessageJobRow({adminId, messageJob}: MessageJobRowProps) {

  const classes = useCommonStyles();
  const {generateMessageJobDetailsPath} = useAdminNavigation();

  const handleMessageJobClick = () => {
    window.open(generateMessageJobDetailsPath(adminId, messageJob.id!), '_blank');
  };

  return (
      <TableRow hover onClick={handleMessageJobClick} className={classes.cursorPointer}>
        <TableCell>
          <MessageJobStatus messageJobOrTask={messageJob} />
        </TableCell>
        <TableCell>
          <Span i18n="admin:protocols_messages_size_text" parameters={{ numberOfMessageTasks: messageJob.numberOfMessageTasks }} />
        </TableCell>
        <TableCell className={classes.textAlignRight}>
          <LocalDate date={messageJob.createdAt} /> <Time date={messageJob.createdAt} />
        </TableCell>
      </TableRow>
  );
}