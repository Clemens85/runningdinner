import React from 'react';
import {Controller, useFormContext} from "react-hook-form";
import TextField, {TextFieldProps} from "@mui/material/TextField";
import {styled} from "@mui/material";
import {spacing} from "@mui/system";
import {get} from 'lodash-es';

export type FormTextFieldProps = Omit<TextFieldProps, "name"> & {
  name: string;
  label: React.ReactNode;
  defaultValue?: unknown;
};

const FormTextFieldInternal = ({name, label, defaultValue, ...other}: FormTextFieldProps) => {

  const {control, formState: {errors}} = useFormContext();

  let helperText = other.helperText;
  let hasErrors = false;

  const errorMessageObj = get(errors, name, undefined);
  if (errorMessageObj) {
    helperText = errorMessageObj.message as string;
    hasErrors = true;
  }

  return (
    <Controller control={control}
                defaultValue={defaultValue}
                name={name}
                render={({field}) => (
                  <TextField {...field}
                             {... other} 
                             helperText={helperText} 
                             label={label} 
                             error={hasErrors} />
                )}
    />
  );
};

const FormTextField = styled(FormTextFieldInternal)(spacing);
export default FormTextField;
