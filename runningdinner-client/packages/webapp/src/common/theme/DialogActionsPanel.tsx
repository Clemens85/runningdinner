import {Box, DialogActions, useMediaQuery, useTheme} from "@mui/material";
import {PrimarySuccessButtonAsync} from "./PrimarySuccessButtonAsync";
import React from "react";
import SecondaryButton from "./SecondaryButton";
import {PrimaryDangerButtonAsync} from "./PrimaryDangerButtonAsync";
import {CallbackHandler} from "@runningdinner/shared";
import {commonStyles} from "./CommonStyles";

export interface DialogActionsPanelProps {
  onOk: CallbackHandler;
  onCancel: CallbackHandler;
  okLabel: React.ReactNode;
  cancelLabel: React.ReactNode;
  danger?: boolean;
  padding?: number;
}

const DialogActionsPanel = ({onOk, okLabel, danger = false, onCancel, cancelLabel, padding = 2}: DialogActionsPanelProps) => {

  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('md'));

  const fullWidthProps = isMobileDevice ? commonStyles.fullWidth : {};
  return (
      <DialogActions>
        <Box sx={{ ...fullWidthProps, p: padding }}>
          <SecondaryButton onClick={onCancel} sx={fullWidthProps} data-testid="dialog-cancel">{cancelLabel}</SecondaryButton>
          { danger ? <PrimaryDangerButtonAsync onClick={onOk} size={"medium"} sx={fullWidthProps} data-testid="dialog-submit">
                        {okLabel}
                      </PrimaryDangerButtonAsync>
                    : <PrimarySuccessButtonAsync onClick={onOk} size={"medium"} sx={fullWidthProps} data-testid="dialog-submit">
                        {okLabel}
                      </PrimarySuccessButtonAsync> }
        </Box>
      </DialogActions>
  );
};
export default DialogActionsPanel;



