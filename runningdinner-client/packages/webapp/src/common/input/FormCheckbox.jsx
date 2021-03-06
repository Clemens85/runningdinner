import React from 'react';
import {Controller, useFormContext} from "react-hook-form";
import {Checkbox, FormControlLabel, FormHelperText} from "@material-ui/core";

const FormCheckbox = ({name, label}) => {

  const {control, errors} = useFormContext();

  const hasErrors = errors[name] ? true : false;
  const errorMessage = hasErrors ? errors[name].message : undefined;

  return (
      <>
        <FormControlLabel label={label} control={
          <Controller as={<Checkbox color="primary"/>} name={name} control={control} />
        } />
        { hasErrors && <FormHelperText error={hasErrors}>{errorMessage}</FormHelperText> }
      </>
  );
};
export default FormCheckbox;

