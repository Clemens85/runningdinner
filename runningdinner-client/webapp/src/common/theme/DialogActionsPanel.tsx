import {Box, DialogActions, useMediaQuery, useTheme} from "@mui/material";
import {PrimarySuccessButtonAsync} from "./PrimarySuccessButtonAsync";
import React from "react";
import SecondaryButton from "./SecondaryButton";
import {PrimaryDangerButtonAsync} from "./PrimaryDangerButtonAsync";
import {CallbackHandler} from "@runningdinner/shared";
import {commonStyles} from "./CommonStyles";
import { DefaultDialogCancelButtonProps } from "./dialog/DialogActionsButtons";

export interface DialogActionsPanelProps extends DefaultDialogCancelButtonProps {
  onOk: CallbackHandler;
  okLabel: React.ReactNode;
  danger?: boolean;
  padding?: number;
  okButtonDisabled?: boolean;
}

const DialogActionsPanel = ({onOk, okLabel, danger = false, onCancel, cancelLabel, okButtonDisabled, padding = 2}: DialogActionsPanelProps) => {

  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('md'));
  const fullWidthProps = isMobileDevice ? commonStyles.fullWidth : {};
  
  const diableOkButton = !!okButtonDisabled;

  return (
      <DialogActions>
        <Box sx={{ ...fullWidthProps, p: padding }}>
          <SecondaryButton onClick={onCancel} sx={fullWidthProps} data-testid="dialog-cancel">{cancelLabel}</SecondaryButton>
          { danger ? <PrimaryDangerButtonAsync disabled={diableOkButton} onClick={onOk} size={"medium"} sx={fullWidthProps} data-testid="dialog-submit">
                        {okLabel}
                      </PrimaryDangerButtonAsync>
                    : <PrimarySuccessButtonAsync disabled={diableOkButton} onClick={onOk} size={"medium"} sx={fullWidthProps} data-testid="dialog-submit">
                        {okLabel}
                      </PrimarySuccessButtonAsync> }
        </Box>
      </DialogActions>
  );
};
export default DialogActionsPanel;



