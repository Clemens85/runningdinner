import React from 'react';
import { Box, }from "@material-ui/core";
import {Alert} from "@material-ui/lab";
import {useTranslation} from "react-i18next";
import { PrimaryButton } from '../../../common/theme/PrimaryButton';
import { BaseRunningDinnerProps, useDisclosure } from '@runningdinner/shared';
import { WaitingListManagementDialog } from './WaitingListManagementDialog';

export type ReFetchParticipantsCallback = {
  onReFetch: () => Promise<any>;
};

type WaitingListManagementAlertProps = {
  teamsGenerated: boolean;
} & BaseRunningDinnerProps & ReFetchParticipantsCallback;

export function WaitingListManagementAlert(props: WaitingListManagementAlertProps) {

  const {t} = useTranslation('admin');

  const {isOpen, close, open} = useDisclosure();

  function handleClose() {
    close();
    props.onReFetch();
  }

  const participantsWaitingListAlertMessage = props.teamsGenerated ? 'participants_remaining_not_assignable_teams_generated_text' : 'participants_remaining_not_assignable_text';

  return (
    <>
      <Alert severity={"success"} variant="outlined">
        {/*<AlertTitle>{t('participants_remaining_not_assignable_headline')}</AlertTitle>*/}
        {t(participantsWaitingListAlertMessage)}
        <Box mt={2}>
          <PrimaryButton onClick={open} data-testid={"open-waitinglist-view-action"}>{t('admin:waitinglist_management')}</PrimaryButton>
        </Box>
      </Alert>
      { isOpen && <WaitingListManagementDialog {... props} onClose={handleClose}/> }
    </>
  );
}