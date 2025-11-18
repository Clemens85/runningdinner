import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import { get } from 'lodash-es';

const TextInputWatchable = ({ name, label, onChange, ...other }) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  let helperText = other.helperText;
  let hasErrors = false;

  const errorMessageObj = get(errors, name, undefined);
  if (errorMessageObj) {
    helperText = errorMessageObj.message;
    hasErrors = true;
  }

  const handleChange = (changeEvt) => {
    const changedValue = changeEvt.target.value;
    if (onChange) {
      onChange(changedValue);
    }
  };

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => (
        <TextField
          onChange={(changeEvt) => {
            onChange(changeEvt);
            handleChange(changeEvt);
          }}
          {...other}
          value={value}
          helperText={helperText}
          label={label}
          error={hasErrors}
        />
      )}
    />
  );
};
export default TextInputWatchable;
