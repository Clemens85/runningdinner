import React from 'react';
import {Checkbox, FormControl, FormControlLabel, FormHelperText} from "@material-ui/core";
import {FormCheckboxProps} from "./FormCheckbox";

export function FormCheckboxSimple({name, label, helperText, defaultValue, useTableDisplay, checked, ...rest}: FormCheckboxProps) {
  return (
    <FormControl>
      <FormControlLabel label={label} style={useTableDisplay ? {display: 'table'}: {}} control={
        <div style={{display: useTableDisplay ? 'table-cell' : 'inline'}}>
          <Checkbox color="primary"
                    name={name}
                    checked
                    {...rest} />
        </div>
      } />
      { helperText && <FormHelperText>{helperText}</FormHelperText> }
    </FormControl>
  );
}