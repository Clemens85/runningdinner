import React from 'react';
import {Controller, useFormContext} from "react-hook-form";
import {Checkbox, FormControl, FormControlLabel, FormHelperText, styled} from "@material-ui/core";
import {spacing} from "@material-ui/system";
import {CheckboxProps} from "@material-ui/core/Checkbox/Checkbox";
import {isStringNotEmpty} from "@runningdinner/shared";

export interface FormCheckboxProps extends CheckboxProps {
  name: string;
  label: React.ReactNode;
  helperText?: React.ReactNode;
}

const FormCheckboxInternal = ({name, label, helperText, ...rest}: FormCheckboxProps) => {

  const {control, errors} = useFormContext();

  const hasErrors = errors[name] ? true : false;
  const errorMessage = hasErrors ? errors[name].message : undefined;
  const helperTextToDisplay = hasErrors ? errorMessage : helperText;

  return (
      <FormControl error={hasErrors}>
        <FormControlLabel label={label} control={
          <Controller name={name} control={control} render={(props) => (
              <Checkbox color="primary" {...rest}
                        onChange={(e) => props.onChange(e.target.checked)}
                        checked={props.value} />
          )} />
        } />
        { isStringNotEmpty(helperTextToDisplay) && <FormHelperText error={hasErrors}>{helperTextToDisplay}</FormHelperText> }
      </FormControl>
  );
};


const FormCheckbox = styled(FormCheckboxInternal)(spacing);
export default FormCheckbox;
