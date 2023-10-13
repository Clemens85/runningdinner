import React from 'react';
import {Controller, useFormContext} from "react-hook-form";
import {FormControl, InputLabel, FormHelperText, Select, SelectProps, styled} from "@mui/material";
import {isStringNotEmpty} from "@runningdinner/shared";
import {spacing} from "@mui/system";

export interface SelectWatchableProps extends SelectProps {
  name: string;
  label: string;
  helperText?: string;
  defaultValue?: unknown;
}

function FormSelectInternal({name, label, children, helperText, fullWidth, variant, defaultValue, ...other}: SelectWatchableProps) {

  const {formState: { errors }, control} = useFormContext();

  const errorMessage = isStringNotEmpty(name) ? errors[name]?.message : "";
  const hasErrors = isStringNotEmpty(errorMessage as string);
  const helperTextToDisplay = (hasErrors ? errorMessage : helperText) as string;

  return <>
    <Controller
        name={name}
        defaultValue={defaultValue}
        control={control}
        render={({field}) => (
            <>
              <FormControl fullWidth={fullWidth} error={hasErrors} variant={variant}>
                <InputLabel required>{label}</InputLabel>
                <Select
                  {...Object.assign({}, field, other)}
                  label={label}
                  variant={variant}
                  inputProps={{ 'aria-label': label }}>
                  {children}
                </Select>
              </FormControl>
              { isStringNotEmpty(helperTextToDisplay) && <FormHelperText error={hasErrors}>{helperTextToDisplay}</FormHelperText> }
            </>
        )}
    />
  </>;
}

const FormSelect = styled(FormSelectInternal)(spacing);
export default FormSelect;
