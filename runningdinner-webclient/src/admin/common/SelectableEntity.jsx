import Fullname from "shared/Fullname";
import {Checkbox, FormControlLabel} from "@material-ui/core";
import React from "react";

function SelectableEntity({entity, onSelectionChange, disabled}) {

  const fullName = <Fullname {...entity} />;

  const handleChange = changeEvt => {
    const selected = changeEvt.target.checked;
    onSelectionChange(entity, selected);
  };

  const selected = !!entity.selected;

  return (
      <FormControlLabel disabled={disabled} label={fullName} control={
        <Checkbox color="primary" disabled={disabled} onChange={handleChange} checked={selected} />
      } />
  );
}

SelectableEntity.defaultProps = {
  disabled: false
};
export default SelectableEntity;
