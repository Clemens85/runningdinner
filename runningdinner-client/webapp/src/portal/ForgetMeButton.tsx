import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { clearAllCredentials } from '@runningdinner/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { MY_EVENTS_PATH } from '../common/mainnavigation/NavigationPaths';

export function ForgetMeButton() {
  const { t } = useTranslation('portal');
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    clearAllCredentials();
    setOpen(false);
    navigate(`${MY_EVENTS_PATH}`, { replace: true });
  };

  return (
    <>
      <Button variant="outlined" color="error" size="small" onClick={() => setOpen(true)}>
        {t('forget_me_button')}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{t('forget_me_dialog_title')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('forget_me_dialog_text')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('forget_me_dialog_cancel')}</Button>
          <Button onClick={handleConfirm} color="error" variant="contained" autoFocus>
            {t('forget_me_dialog_confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
