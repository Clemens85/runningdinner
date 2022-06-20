import React from 'react'
import { Alert, AlertTitle } from '@material-ui/lab';
import {useDisclosure, useParticipantsListInfo} from "@runningdinner/shared";
import { Box } from '@material-ui/core';

export default function ParticipantsListInfo(props) {

  const { participants, runningDinnerSessionData, hasSearchText } = props;
  const { message, title, severity, show } = useParticipantsListInfo(participants, runningDinnerSessionData);

  // For now it is good enough to hold the state just locally (=> alert will disappear as long as user do not refresh browser)
  const {isOpen, close, open} = useDisclosure(show);

  React.useEffect(() => {
    if (show) {
      open();
    }
    // eslint-disable-next-line
  }, [show]);


  return (
      <Box mb={isOpen ? 3 : undefined}>
      {
        (isOpen && !hasSearchText) &&
            <Alert severity={severity} variant="outlined" onClose={close} data-testid={"participant-list-info-box"}>
              <AlertTitle>{title}</AlertTitle>
              {message}
            </Alert>
      }
      </Box>
  );
}
