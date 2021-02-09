import React from 'react';
import {useFormContext} from "react-hook-form";
import TextField from "@material-ui/core/TextField";

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
      <TextField error={hasErrors}
                 helperText={errorMessage}
                 inputRef={register}
                 onChange={handleChange}
                 {...other}
                 name={name}
                 label={label} />
  );
};
export default TextInputWatchable;

