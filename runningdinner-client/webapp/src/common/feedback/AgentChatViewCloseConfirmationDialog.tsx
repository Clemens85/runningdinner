import { Box, Dialog, DialogActions, DialogContent, DialogContentText, Stack, useMediaQuery, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { DialogTitleCloseable } from '../theme/DialogTitleCloseable';
import { PrimaryButton } from '../theme/PrimaryButton';
import SecondaryButton from '../theme/SecondaryButton';

export interface FeedbackCloseConfirmationDialogProps {
  open: boolean;
  onConfirm: (wantsEmailResponse: boolean) => void;
}

export function AgentChatViewCloseConfirmationDialog({ open, onConfirm }: FeedbackCloseConfirmationDialogProps) {
  const { t } = useTranslation('common');
  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down('md'));

  const handleWantsEmail = () => {
    onConfirm(true);
  };

  const handleNoEmailNeeded = () => {
    onConfirm(false);
  };

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason !== 'backdropClick') {
          handleWantsEmail();
        }
      }}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitleCloseable onClose={handleWantsEmail}>{t('common:feedback_close_confirmation_title')}</DialogTitleCloseable>
      <DialogContent>
        <DialogContentText id="feedback-close-confirmation-description">{t('common:feedback_close_confirmation_message')}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
        <Stack
          direction={isSmallDevice ? 'column' : 'row'}
          spacing={2}
          sx={{
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: isSmallDevice ? '100%' : 'auto',
            }}
          >
            <PrimaryButton onClick={handleWantsEmail} fullWidth={isSmallDevice} autoFocus>
              {t('common:feedback_close_yes_need_email')}
            </PrimaryButton>
          </Box>
          <Box
            sx={{
              width: isSmallDevice ? '100%' : 'auto',
            }}
          >
            <SecondaryButton onClick={handleNoEmailNeeded} fullWidth={isSmallDevice}>
              {t('common:feedback_close_no_email_needed')}
            </SecondaryButton>
          </Box>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
