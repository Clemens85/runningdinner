import {Box, LinearProgress, Paper, TableCell} from "@mui/material";
import {Span, Subtitle} from "../../../common/theme/typography/Tags";
import {
  formatLocalDateWithSeconds,
  isArrayEmpty,
  LocalDate,
  MessageJob,
  Time,
  BaseAdminIdProps,
  MessageType,
  useFindMessageJobs,
  isQuerySucceeded
} from "@runningdinner/shared";
import Grid from "@mui/material/Grid";
import {MessageJobStatus} from "./MessageJobStatus";
import Paragraph from "../../../common/theme/typography/Paragraph";
import {TableRowWithCursor} from "../../../common/theme/CommonStyles";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import {HelpIconTooltip} from "../../../common/theme/HelpIconTooltip";
import {useAdminNavigation} from "../../AdminNavigationHook";

type MessageJobsOverviewProps = {
  messageType: MessageType
} & BaseAdminIdProps;

function getLastUpdatedDateFormatted(dataUpdatedAt: number | undefined): string | undefined {
  let date = new Date();
  if (dataUpdatedAt) {
    date = new Date(dataUpdatedAt);
  }
  return formatLocalDateWithSeconds(date);
}

export function MessageJobsOverview({adminId, messageType}: MessageJobsOverviewProps) {

  const messageJobsQueryResult = useFindMessageJobs(adminId, messageType);
  const messageJobs = messageJobsQueryResult.data || [];

  const lastPollDateFormatted = getLastUpdatedDateFormatted(messageJobsQueryResult.dataUpdatedAt);

  if (!isQuerySucceeded(messageJobsQueryResult)) {
    return <LinearProgress color="secondary" />;
  }

  const protocolsSubtitle = `admin:protocols_${messageType}`;

  return (
    <>
      <Box mb={2}>
        <Subtitle i18n={protocolsSubtitle} />
      </Box>
      <Paper elevation={3}>
        <Box p={2}>
          { isArrayEmpty(messageJobs) && <i><Span i18n="admin:protocols_empty"/></i> }
          { !isArrayEmpty(messageJobs) && <MessageJobsTable adminId={adminId} messageJobs={messageJobs}/> }
          <Box mt={2}>
            <Grid container justifyContent="space-between">
              { !isArrayEmpty(messageJobs) &&
                <Grid item>
                  <Grid container alignItems="center" spacing={1}>
                    <Grid item><Span>Info</Span></Grid>
                    <Grid item><HelpIconTooltip title={<Paragraph i18n='admin:synchronize_messagejobs_help'/>} placement='right' /></Grid>
                  </Grid>
                </Grid> }
              <Grid item sx={{ textAlign: "right" }}>
                <i><Span i18n="admin:protocols_last_update_text" parameters={{ lastPollDate: lastPollDateFormatted }} /></i>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>
    </>
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

  const {generateMessageJobDetailsPath} = useAdminNavigation();

  const handleMessageJobClick = () => {
    window.open(generateMessageJobDetailsPath(adminId, messageJob.id!), '_blank');
  };

  return (
      <TableRowWithCursor hover onClick={handleMessageJobClick}>
        <TableCell>
          <MessageJobStatus messageJobOrTask={messageJob} />
        </TableCell>
        <TableCell>
          <Span i18n="admin:protocols_messages_size_text" parameters={{ numberOfMessageTasks: messageJob.numberOfMessageTasks }} />
        </TableCell>
        <TableCell sx={{ textAlign: "right" }}>
          <LocalDate date={messageJob.createdAt} /> <Time date={messageJob.createdAt} />
        </TableCell>
      </TableRowWithCursor>
  );
}