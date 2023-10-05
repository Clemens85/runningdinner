import React from 'react';
import {Controller, useFormContext} from "react-hook-form";
import {Checkbox, FormControl, FormControlLabel, FormHelperText, styled} from "@mui/material";
import {spacing} from "@mui/system";
import {CheckboxProps} from "@mui/material/Checkbox/Checkbox";
import {isStringNotEmpty} from "@runningdinner/shared";

export interface FormCheckboxProps extends Omit<CheckboxProps, "defaultValue"> {
  name: string;
  label: React.ReactNode;
  helperText?: React.ReactNode;
  defaultValue?: unknown;
  useTableDisplay?: boolean;
}

const FormCheckboxInternal = ({name, label, helperText, defaultValue, useTableDisplay, ...rest}: FormCheckboxProps) => {

  const {control, formState: {errors}} = useFormContext();

  const hasErrors = !!errors[name];
  // @ts-ignore
  const errorMessage = hasErrors ? errors[name].message : undefined;
  const helperTextToDisplay = (hasErrors ? errorMessage : helperText) as string;

  return (
    <FormControl variant="standard" error={hasErrors}>
      <FormControlLabel label={label} style={useTableDisplay ? {display: 'table'}: {}} control={
        <Controller defaultValue={defaultValue} 
                    name={name} 
                    control={control} 
                    render={({field}) => (
          <div style={{display: useTableDisplay ? 'table-cell' : 'inline'}}>
            <Checkbox color="primary" 
                      {...rest}
                      onChange={(e) => field.onChange(e.target.checked)}
                      checked={field.value} />
          </div>
        )} />
      } />
      { isStringNotEmpty(helperTextToDisplay) && <FormHelperText error={hasErrors}>{helperTextToDisplay}</FormHelperText> }
    </FormControl>
  );
};


const FormCheckbox = styled(FormCheckboxInternal)(spacing);
export default FormCheckbox;
