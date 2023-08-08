import {Box, DialogActions, useMediaQuery, useTheme} from "@mui/material";
import {PrimarySuccessButtonAsync} from "./PrimarySuccessButtonAsync";
import React from "react";
import SecondaryButton from "./SecondaryButton";
import {PrimaryDangerButtonAsync} from "./PrimaryDangerButtonAsync";
import {CallbackHandler} from "@runningdinner/shared";
import useCommonStyles from "./CommonStyles";

export interface DialogActionsPanelProps {
  onOk: CallbackHandler;
  onCancel: CallbackHandler;
  okLabel: React.ReactNode;
  cancelLabel: React.ReactNode;
  danger?: boolean;
  padding?: number;
}

const DialogActionsPanel = ({onOk, okLabel, danger = false, onCancel, cancelLabel, padding = 2}: DialogActionsPanelProps) => {

  const commonStyles = useCommonStyles()

  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('md'));

  return (
      <DialogActions>
        <Box p={padding} className={isMobileDevice ? commonStyles.fullWidth: ""}>
          <SecondaryButton onClick={onCancel} className={isMobileDevice ? commonStyles.fullWidth: ""} data-testid="dialog-cancel">{cancelLabel}</SecondaryButton>
          { danger ? <PrimaryDangerButtonAsync onClick={onOk} size={"medium"} className={isMobileDevice ? commonStyles.fullWidth: ""} data-testid="dialog-submit">
                        {okLabel}
                      </PrimaryDangerButtonAsync>
                    : <PrimarySuccessButtonAsync onClick={onOk} size={"medium"} className={isMobileDevice ? commonStyles.fullWidth: ""} data-testid="dialog-submit">
                        {okLabel}
                      </PrimarySuccessButtonAsync> }
        </Box>
      </DialogActions>
  );
};
export default DialogActionsPanel;



