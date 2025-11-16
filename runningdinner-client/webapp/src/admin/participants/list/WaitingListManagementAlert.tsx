import { Box } from '@mui/material';
import { Alert } from '@mui/material';
import { BaseRunningDinnerProps, useDisclosure, useFindParticipants } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';

import { PrimaryButton } from '../../../common/theme/PrimaryButton';
import { WaitingListManagementDialog } from './WaitingListManagementDialog';

type WaitingListManagementAlertProps = {
  teamsGenerated: boolean;
} & BaseRunningDinnerProps;

export function WaitingListManagementAlert(props: WaitingListManagementAlertProps) {
  const { t } = useTranslation('admin');

  const { isOpen, close, open } = useDisclosure();

  const { refetch: refetchParticipantList } = useFindParticipants(props.runningDinner.adminId);

  function handleClose() {
    close();
    refetchParticipantList();
  }

  const participantsWaitingListAlertMessage = props.teamsGenerated ? 'participants_remaining_not_assignable_teams_generated_text' : 'participants_remaining_not_assignable_text';

  return (
    <>
      <Alert severity={'success'} variant="outlined">
        {t(participantsWaitingListAlertMessage)}
        <Box mt={2}>
          <PrimaryButton onClick={open} data-testid={'open-waitinglist-view-action'}>
            {t('admin:waitinglist_management')}
          </PrimaryButton>
        </Box>
      </Alert>
      {isOpen && <WaitingListManagementDialog {...props} onClose={handleClose} />}
    </>
  );
}
