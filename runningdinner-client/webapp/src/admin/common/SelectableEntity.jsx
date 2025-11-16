import { Checkbox, FormControlLabel } from '@mui/material';
import React from 'react';
import { useRecipientName } from '@runningdinner/shared';

function SelectableEntity(props) {
  const { entity, onSelectionChange, disabled, ...rest } = props;

  const { recipientName } = useRecipientName(entity);

  const handleChange = (changeEvt) => {
    const selected = changeEvt.target.checked;
    onSelectionChange(entity, selected);
  };

  const selected = !!entity.selected;

  return (
    <FormControlLabel disabled={disabled} label={recipientName} control={<Checkbox color="primary" disabled={disabled} onChange={handleChange} checked={selected} {...rest} />} />
  );
}

SelectableEntity.defaultProps = {
  disabled: false,
};
export default SelectableEntity;
