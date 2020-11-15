import React from 'react'
import { Alert, AlertTitle } from '@material-ui/lab';
import useParticipantsListInfo from "../../../shared/admin/participants/ParticipantsListInfoHook";

export default function ParticipantsListInfo(props) {

  const { participants, runningDinnerSessionData, hasSearchText } = props;
  const { message, title, severity, show } = useParticipantsListInfo(participants, runningDinnerSessionData);

  return (
      <>
      {
        (show && !hasSearchText) &&
            <Alert severity={severity} variant="outlined" onClose={() => {}}>
              <AlertTitle>{title}</AlertTitle>
              {message}
            </Alert>
      }
      </>
  );
}
