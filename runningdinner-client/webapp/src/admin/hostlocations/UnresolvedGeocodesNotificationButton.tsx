import NotificationsIcon from '@mui/icons-material/Notifications';
import { Badge,IconButton } from '@mui/material';
import { isArrayEmpty, useDisclosure } from '@runningdinner/shared';
import { useTranslation } from 'react-i18next';

import { UnresolvedGeocodesWarningAlertProps, WarningAlert } from '../../common/dinnerroute';
import { ConfirmationDialog } from '../../common/theme/dialog/ConfirmationDialog';

export function UnresolvedGeocodesNotificationButton({ teamsWithUnresolvedGeocodings }: UnresolvedGeocodesWarningAlertProps) {
  const { isOpen, open, close } = useDisclosure();
  const { t } = useTranslation('common');

  if (isArrayEmpty(teamsWithUnresolvedGeocodings)) {
    return null;
  }

  return (
    <>
      <IconButton color="inherit" sx={{ ml: 1 }} onClick={open}>
        <Badge badgeContent={teamsWithUnresolvedGeocodings.length} color="warning">
          <NotificationsIcon color="inherit" />
        </Badge>
      </IconButton>
      {isOpen && (
        <ConfirmationDialog
          buttonConfirmText={t('common:ok')}
          onClose={close}
          dialogTitle={t('common:attention')}
          dialogContent={<WarningAlert teamsWithUnresolvedGeocodings={teamsWithUnresolvedGeocodings} hideCloseButton={true} />}
        />
      )}
    </>
  );
}
