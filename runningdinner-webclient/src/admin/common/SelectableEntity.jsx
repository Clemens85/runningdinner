import {Checkbox, FormControlLabel} from "@material-ui/core";
import React from "react";
import useRecipientName from "../../shared/admin/messages/RecipientNameHook";

function SelectableEntity({entity, onSelectionChange, disabled}) {

  const {recipientName} = useRecipientName(entity);

  const handleChange = changeEvt => {
    const selected = changeEvt.target.checked;
    onSelectionChange(entity, selected);
  };

  const selected = !!entity.selected;

  return (
      <FormControlLabel disabled={disabled} label={recipientName} control={
        <Checkbox color="primary" disabled={disabled} onChange={handleChange} checked={selected} />
      } />
  );
}

SelectableEntity.defaultProps = {
  disabled: false
};
export default SelectableEntity;
