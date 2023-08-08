import React from 'react';
import {useFormContext} from "react-hook-form";
import TextField from "@mui/material/TextField";

const TextInputWatchable = ({name, label, onChange, ...other}) => {

  const {register, errors} = useFormContext();

  const hasErrors = errors[name] ? true : false;
  const errorMessage = hasErrors ? errors[name].message : undefined;

  const handleChange = changeEvt => {
    const changedValue = changeEvt.target.value;
    if (onChange) {
      onChange(changedValue);
    }
  };

  return (
    <TextField
      variant="standard"
      error={hasErrors}
      helperText={errorMessage}
      inputRef={register}
      onChange={handleChange}
      {...other}
      name={name}
      label={label} />
  );
};
export default TextInputWatchable;

