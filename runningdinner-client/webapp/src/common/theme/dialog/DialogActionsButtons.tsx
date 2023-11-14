import { Box, Grid, useMediaQuery, useTheme } from "@mui/material";
import { GridWithCenteredFullwidthButton, commonStyles } from "../CommonStyles";
import { CallbackHandler } from "@runningdinner/shared";
import SecondaryButton from "../SecondaryButton";

type DialogActionsButtonsProps = {
  okButton: React.ReactNode;
  cancelButton: React.ReactNode;
}

export interface DefaultDialogCancelButtonProps {
  onCancel: CallbackHandler;
  cancelLabel: React.ReactNode;
}

export function DefaultDialogCancelButton({onCancel, cancelLabel}: DefaultDialogCancelButtonProps) {

  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('md'));
  const fullWidthProps = isMobileDevice ? commonStyles.fullWidth : {};

  return (
    <SecondaryButton onClick={onCancel} sx={fullWidthProps} data-testid="dialog-cancel">{cancelLabel}</SecondaryButton>
  )
}

export function DialogActionsButtons({okButton, cancelButton}: DialogActionsButtonsProps) {

  const theme = useTheme();
  const isDesktopView = useMediaQuery(theme.breakpoints.up('md'));

  const renderButtonsDesktop = () => {
    return (
      <Box p={2}>
        { cancelButton }
        { okButton }
      </Box>
    );
  };

  const renderButtonsMobile = () => {
    return (
      <Box sx={{width: "100%", p: 1 }}>
        <Grid container direction="column" justifyContent="space-evenly" alignItems="center" spacing={1}>
          { okButton && <GridWithCenteredFullwidthButton item xs={12}>{ okButton }</GridWithCenteredFullwidthButton> }
          <Grid item xs={12} sx={{ textAlign: "center" }}>{ cancelButton }</Grid>
        </Grid>
      </Box>
    );
  };

  if (isDesktopView) {
    return renderButtonsDesktop();
  } else {
    return renderButtonsMobile();
  }
}