import React from 'react';
import { Box, }from "@material-ui/core";
import {Alert, AlertTitle} from "@material-ui/lab";
import {useTranslation} from "react-i18next";
import { PrimaryButton } from '../../../common/theme/PrimaryButton';
import { BaseRunningDinnerProps, Participant, useDisclosure } from '@runningdinner/shared';
import { WaitingListManagementDialog } from './WaitingListManagementDialog';

export interface WaitingListManagementBaseProps extends BaseRunningDinnerProps {
  participantsNotAssignable: Participant[];
}

export function WaitingListManagementAlert(props: WaitingListManagementBaseProps) {

  const {participantsNotAssignable} = props;

  const {t} = useTranslation('admin');

  const {isOpen, close, open, getIsOpenData} = useDisclosure();

  return (
    <>
      <Alert severity={"info"} variant="outlined">
        <AlertTitle>{t('participants_remaining_not_assignable_headline')}</AlertTitle>
        {t('participants_remaining_not_assignable_text')}
        <Box mt={2}>
          <PrimaryButton onClick={open}>Wartelisten-Verwaltung...</PrimaryButton>
        </Box>
      </Alert>
      { isOpen && <WaitingListManagementDialog {... props} 
                                               onCancel={close}
                                               onSave={close} /> }
    </>
  );
}