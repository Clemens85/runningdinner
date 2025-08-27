import NotificationsIcon from '@mui/icons-material/Notifications';
import { IconButton, Badge } from '@mui/material';
import { UnresolvedGeocodesWarningAlertProps, WarningAlert } from '../../common/dinnerroute';
import { isArrayEmpty, useDisclosure } from '@runningdinner/shared';
import { ConfirmationDialog } from '../../common/theme/dialog/ConfirmationDialog';
import { useTranslation } from 'react-i18next';

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
