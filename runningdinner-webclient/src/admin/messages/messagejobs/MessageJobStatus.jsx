import {Span} from "../../../common/theme/typography/Tags";
import React from "react";
import {CONSTANTS} from "../../../shared/Constants";
import SyncIcon from '@material-ui/icons/Sync';
import DoneIcon from '@material-ui/icons/Done';
import ErrorIcon from '@material-ui/icons/Error';
import {Hidden} from "@material-ui/core";
import MessageService from "../../../shared/admin/MessageService";
import Grid from "@material-ui/core/Grid";


function MessageJobStatus({messageJobOrTask}) {

  const status = MessageService.getStatusResult(messageJobOrTask);

  if (status === CONSTANTS.SENDING_STATUS_RESULT.SENDING_NOT_FINISHED) {
    return <MessageJobStatusGrid icon={<SyncIcon />} label={<Span i18n="admin:SENDING_NOT_FINISHED" />} />;
  }
  if (status === CONSTANTS.SENDING_STATUS_RESULT.SENDING_FINISHED_SUCCESS) {
    return <MessageJobStatusGrid icon={<DoneIcon color="primary" />} label={<Span i18n="admin:SENDING_FINISHED_SUCCESS" color="primary" />} />;
  }
  if (status === CONSTANTS.SENDING_STATUS_RESULT.SENDING_FINISHED_FAILURE) {
    return <MessageJobStatusGrid icon={<ErrorIcon color="secondary" />} label={<Span i18n="admin:SENDING_FINISHED_FAILURE" />} />;
  }
  return null;
}

function MessageJobStatusGrid({icon, label}) {
  return (
      <Grid container alignItems="center">
        <Grid item>{icon}</Grid>
        <Grid item>
          <Hidden mdDown>{label}</Hidden>
        </Grid>
      </Grid>
  );
}

export {
  MessageJobStatus
};
