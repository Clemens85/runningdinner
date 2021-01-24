import {Span} from "../../../common/theme/typography/Tags";
import React from "react";
import {CONSTANTS} from "../../../shared/Constants";
import DoneIcon from '@material-ui/icons/Done';
import ErrorIcon from '@material-ui/icons/Error';
import {Hidden} from "@material-ui/core";
import Grid from "@material-ui/core/Grid";
import CircularProgress from "@material-ui/core/CircularProgress";
import {MessageService} from "../../../shared/admin/MessageService";

function MessageJobStatus({messageJobOrTask}) {

  const status = MessageService.getStatusResult(messageJobOrTask);

  if (status === CONSTANTS.SENDING_STATUS_RESULT.SENDING_NOT_FINISHED) {
    return <MessageJobStatusGrid icon={<CircularProgress size={20} />}
                                 label={<MessageJobStatusLabel label="admin:SENDING_NOT_FINISHED" color="inherit" />} />;
  }
  if (status === CONSTANTS.SENDING_STATUS_RESULT.SENDING_FINISHED_SUCCESS) {
    return <MessageJobStatusGrid icon={<DoneIcon color="primary" />}
                                 label={<MessageJobStatusLabel label="admin:SENDING_FINISHED_SUCCESS" color="primary" />} />;
  }
  if (status === CONSTANTS.SENDING_STATUS_RESULT.SENDING_FINISHED_FAILURE) {
    return <MessageJobStatusGrid icon={<ErrorIcon color="secondary" />}
                                 label={<MessageJobStatusLabel label="admin:SENDING_FINISHED_FAILURE" color="secondary" />} />;
  }
  return null;
}

function MessageJobStatusGrid({icon, label}) {
  return (
      <Grid container alignItems="center">
        <Grid item>{icon}</Grid>
        <Grid item>
          <Hidden mdDown>
            {label}
          </Hidden>
        </Grid>
      </Grid>
  );
}

function MessageJobStatusLabel({label, color}) {
  return <Span i18n={label} color={color} style={{ paddingLeft: '3px'}} />;
}

export {
  MessageJobStatus
};
