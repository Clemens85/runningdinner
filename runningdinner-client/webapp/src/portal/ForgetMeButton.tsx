import PhonelinkEraseIcon from '@mui/icons-material/PhonelinkErase';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Tooltip } from '@mui/material';
import { clearAllCredentials } from '@runningdinner/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { MY_EVENTS_PATH } from '../common/mainnavigation/NavigationPaths';
import SecondaryButton from '../common/theme/SecondaryButton';

type ForgetMeButtonProps = {
  iconOnly?: boolean;
};

export function ForgetMeButton({ iconOnly = false }: ForgetMeButtonProps) {
  const { t } = useTranslation('portal');
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    clearAllCredentials();
    window.location.replace(MY_EVENTS_PATH);
  };

  const trigger = iconOnly ? (
    <Tooltip title={t('forget_me_button')} placement="top">
      <IconButton size="small" color="error" onClick={() => setOpen(true)}>
        <PhonelinkEraseIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  ) : (
    <Button variant="outlined" color="error" size="small" onClick={() => setOpen(true)}>
      {t('forget_me_button')}
    </Button>
  );

  return (
    <>
      {trigger}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('forget_me_dialog_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('forget_me_dialog_text')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <SecondaryButton onClick={() => setOpen(false)}>{t('forget_me_dialog_cancel')}</SecondaryButton>
          <Button onClick={handleConfirm} color="error" variant="contained" autoFocus>
            {t('forget_me_dialog_confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
