import React from 'react';
import {Controller, useFormContext} from "react-hook-form";
import TextField, {TextFieldProps} from "@mui/material/TextField";
import {styled} from "@mui/material";
import {spacing} from "@mui/system";
import get from "lodash/get";

export type FormTextFieldProps = Omit<TextFieldProps, "name"> & {
  name: string;
  label: React.ReactNode;
  defaultValue?: unknown;
};

const FormTextFieldInternal = ({name, label, defaultValue, ...other}: FormTextFieldProps) => {

  const {control, errors} = useFormContext();

  let helperText = other.helperText;
  let hasErrors = false;

  const errorMessageObj = get(errors, name, undefined);
  if (errorMessageObj) {
    helperText = errorMessageObj.message;
    hasErrors = true;
  }

  return (
      // @ts-ignore
      <Controller as={TextField}
                  defaultValue={defaultValue}
                  control={control}
                  {... other}
                  name={name}
                  error={hasErrors}
                  helperText={helperText}
                  label={label} />
  );
};

const FormTextField = styled(FormTextFieldInternal)(spacing);
export default FormTextField;
