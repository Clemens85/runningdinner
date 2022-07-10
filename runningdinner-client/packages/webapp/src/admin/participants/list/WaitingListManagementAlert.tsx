import React from 'react';
import { Box, }from "@material-ui/core";
import {Alert, AlertTitle} from "@material-ui/lab";
import {useTranslation} from "react-i18next";
import { PrimaryButton } from '../../../common/theme/PrimaryButton';
import { BaseRunningDinnerProps, useDisclosure } from '@runningdinner/shared';
import { WaitingListManagementDialog } from './WaitingListManagementDialog';

export type ReFetchParticipantsCallback = {
  onReFetch: () => Promise<any>;
};

export function WaitingListManagementAlert(props: BaseRunningDinnerProps & ReFetchParticipantsCallback) {

  const {t} = useTranslation('admin');

  const {isOpen, close, open} = useDisclosure();

  function handleClose() {
    close();
    props.onReFetch();
  }

  return (
    <>
      <Alert severity={"success"} variant="outlined">
        <AlertTitle>{t('participants_remaining_not_assignable_headline')}</AlertTitle>
        {t('participants_remaining_not_assignable_text')}
        <Box mt={2}>
          <PrimaryButton onClick={open} data-testid={"open-waitinglist-view-action"}>{t('admin:waitinglist_management')}</PrimaryButton>
        </Box>
      </Alert>
      { isOpen && <WaitingListManagementDialog {... props} onClose={handleClose}/> }
    </>
  );
}