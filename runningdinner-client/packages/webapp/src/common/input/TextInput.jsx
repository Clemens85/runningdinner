import React from 'react';
import {Controller, useFormContext} from "react-hook-form";
import TextField from "@material-ui/core/TextField";

const TextInput = ({name, label, ...other}) => {

  const {control, errors} = useFormContext();

  const hasErrors = errors[name] ? true : false;
  let helperText = other.helperText;

  if (hasErrors) {
    helperText = errors[name].message;
  }

  return (
      <Controller as={TextField}
                  control={control}
                  {... other}
                  name={name}
                  error={hasErrors}
                  helperText={helperText}
                  label={label} />
  );
};
export default TextInput;

