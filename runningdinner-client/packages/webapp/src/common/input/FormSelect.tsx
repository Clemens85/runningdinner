import React from 'react';
import {Controller, useFormContext} from "react-hook-form";
import {FormControl, InputLabel, FormHelperText, Select, SelectProps} from "@material-ui/core";
import {isStringNotEmpty} from "@runningdinner/shared";

export interface SelectWatchableProps extends SelectProps {
  name: string;
  label: string;
  helperText?: string;
}

export default function FormSelect({name, label, children, helperText, fullWidth, variant, ...other}: SelectWatchableProps) {

  const {errors, control} = useFormContext();

  const errorMessage = isStringNotEmpty(name) ? errors[name]?.message : "";
  const hasErrors = isStringNotEmpty(errorMessage);
  const helperTextToDisplay = hasErrors ? errorMessage : helperText;

  return (
      <>
        <Controller
            name={name}
            control={control}
            render={(props) => (
                <>
                  <FormControl fullWidth={fullWidth} error={hasErrors} variant={variant}>
                    <InputLabel required>{label}</InputLabel>
                    <Select {...Object.assign({}, props, other)}
                            inputProps={{ 'aria-label': label }}>
                      {children}
                    </Select>
                  </FormControl>
                  { isStringNotEmpty(helperTextToDisplay) && <FormHelperText error={hasErrors}>{helperTextToDisplay}</FormHelperText> }
                </>
            )}
        />
      </>
  );
}

