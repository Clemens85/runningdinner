import React from "react";
import {Box, LinearProgress, Paper, TableCell, TableRow} from "@material-ui/core";
import {Span, Subtitle} from "../../../common/theme/typography/Tags";
import {queryNotFinishedMessageJobsAsync, useMessagesDispatch, useMessagesState} from "../MessagesContext";
import {isArrayEmpty} from "../../../shared/Utils";
import Grid from "@material-ui/core/Grid";
import LocalDate from "../../../shared/date/LocalDate";
import Time from "../../../shared/date/Time";
import {MessageJobStatus} from "./MessageJobStatus";
import * as DateUtils from "../../../shared/date/DateUtils";
import Paragraph from "../../../common/theme/typography/Paragraph";
import HelpIconTooltip from "../../../common/theme/HelpIconTooltip";
import useCommonStyles from "../../../common/theme/CommonStyles";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";

function MessageJobsOverview({adminId}) {

  const {messageJobs, messageType, lastPollDate, messageJobsLoading} = useMessagesState();
  const dispatch = useMessagesDispatch();

  React.useEffect(() => {
    if (!messageJobsLoading) {
      queryNotFinishedMessageJobsAsync(adminId, messageJobs, messageType, dispatch);
    }
  }, [messageJobs, adminId, messageType, lastPollDate, messageJobsLoading, dispatch]);

  const lastPollDateFormatted = DateUtils.formatLocalDateWithSeconds(lastPollDate);
  const classes = useCommonStyles();

  if (messageJobsLoading) {
    return <LinearProgress color="secondary" />;
  }

  return (
      <Paper elevation={3}>
        <Box p={2}>
          <Box mb={2}>
            <Subtitle i18n="admin:protocols" />
          </Box>
          { isArrayEmpty(messageJobs) && <i><Span i18n="admin:protocols_empty"/></i> }
          { !isArrayEmpty(messageJobs) && <MessageJobsTable messageJobs={messageJobs}/> }
          <Box mt={2}>
            <Grid container justify="space-between">
              { !isArrayEmpty(messageJobs) &&
                <Grid item>
                  <Grid container alignItems="center" spacing={1}>
                    <Grid item><Span>Info</Span></Grid>
                    <Grid item><HelpIconTooltip content={<Paragraph i18n='admin:synchronize_messagejobs_help'/>} placement='right' /></Grid>
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

function MessageJobsTable({messageJobs}) {

  const messageJobRows = messageJobs
                          .map(messageJob => <MessageJobRow key={messageJob.id} messageJob={messageJob}/>);

  return (
      <TableContainer component={Paper}>
        <Table size={"small"}>
          <TableBody>
            { messageJobRows }
          </TableBody>
        </Table>
      </TableContainer>
  );
}

function MessageJobRow({messageJob}) {

  const classes = useCommonStyles();

  const handleMessageJobClick = () => {

  };

  return (
      <TableRow hover onClick={handleMessageJobClick}>
        <TableCell><MessageJobStatus messageJobOrTask={messageJob} /></TableCell>
        <TableCell>
          <Span i18n="admin:protocols_messages_size_text" parameters={{ numberOfMessageTasks: messageJob.numberOfMessageTasks }} />
        </TableCell>
        <TableCell className={classes.textAlignRight}><LocalDate date={messageJob.createdAt} /> <Time date={messageJob.createdAt} /></TableCell>
      </TableRow>
  );
}

export {
  MessageJobsOverview
};
