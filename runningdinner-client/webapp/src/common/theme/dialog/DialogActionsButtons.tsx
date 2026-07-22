import { Box, Stack, useMediaQuery, useTheme } from '@mui/material';
import { CallbackHandler } from '@runningdinner/shared';

import { commonStyles } from '../CommonStyles';
import SecondaryButton from '../SecondaryButton';

type DialogActionsButtonsProps = {
  okButton: React.ReactNode;
  cancelButton: React.ReactNode;
};

export interface DefaultDialogCancelButtonProps {
  onCancel: CallbackHandler;
  cancelLabel: React.ReactNode;
}

export function DefaultDialogCancelButton({ onCancel, cancelLabel }: DefaultDialogCancelButtonProps) {
  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('md'));
  const fullWidthProps = isMobileDevice ? commonStyles.fullWidth : {};

  return (
    <SecondaryButton onClick={onCancel} sx={fullWidthProps} data-testid="dialog-cancel">
      {cancelLabel}
    </SecondaryButton>
  );
}

export function DialogActionsButtons({ okButton, cancelButton }: DialogActionsButtonsProps) {
  const theme = useTheme();
  const isDesktopView = useMediaQuery(theme.breakpoints.up('md'));

  const renderButtonsDesktop = () => {
    return (
      <Box sx={{
        p: 2
      }}>
        {cancelButton}
        {okButton}
      </Box>
    );
  };

  const renderButtonsMobile = () => {
    return (
      <Box sx={{ width: '100%', p: 1 }}>
        <Stack
          direction="column"
          spacing={1}
          sx={{
            justifyContent: "space-evenly",
            alignItems: "center"
          }}>
          {okButton && <Box sx={{ width: '100%', '& button': { width: '100%' } }}>{okButton}</Box>}
          <Box sx={{ textAlign: 'center', width: '100%' }}>
            {cancelButton}
          </Box>
        </Stack>
      </Box>
    );
  };

  if (isDesktopView) {
    return renderButtonsDesktop();
  } else {
    return renderButtonsMobile();
  }
}
