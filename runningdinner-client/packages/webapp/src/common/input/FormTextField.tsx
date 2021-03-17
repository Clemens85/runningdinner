import React from 'react';
import {Controller, useFormContext} from "react-hook-form";
import TextField, {TextFieldProps} from "@material-ui/core/TextField";
import {styled} from "@material-ui/core";
import {spacing} from "@material-ui/system";

export type FormTextFieldProps = Omit<TextFieldProps, "name"> & {
  name: string;
  label: React.ReactNode;
  defaultValue?: unknown;
};

const FormTextFieldInternal = ({name, label, defaultValue, ...other}: FormTextFieldProps) => {

  const {control, errors} = useFormContext();

  const hasErrors = !!errors[name];
  let helperText = other.helperText;

  if (hasErrors) {
    helperText = errors[name].message;
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
