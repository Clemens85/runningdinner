import {Box, DialogActions} from "@material-ui/core";
import {PrimarySuccessButtonAsync} from "./PrimarySuccessButtonAsync";
import React from "react";
import SecondaryButton from "./SecondaryButton";
import {PrimaryDangerButtonAsync} from "./PrimaryDangerButtonAsync";

const DialogActionsPanel = ({onOk, okLabel, danger, onCancel, cancelLabel, padding}) => {

  return (
      <DialogActions>
        <Box p={padding}>
          <SecondaryButton onClick={onCancel}>{cancelLabel}</SecondaryButton>
          { danger ? <PrimaryDangerButtonAsync onClick={onOk} size={"medium"}>{okLabel}</PrimaryDangerButtonAsync>
                    : <PrimarySuccessButtonAsync onClick={onOk} size={"medium"}>{okLabel}</PrimarySuccessButtonAsync> }
        </Box>
      </DialogActions>
  );
};
DialogActionsPanel.defaultProps = {
  padding: 2,
  danger: false
};

export default DialogActionsPanel;



