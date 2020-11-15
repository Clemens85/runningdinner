import React from 'react';
import {useFormContext} from "react-hook-form";
import { FormControl, InputLabel, FormHelperText, Select } from "@material-ui/core";

const SelectWatchable = ({name, label, onChange, selectionOptions, ...other}) => {

  const {register, errors, setValue, watch} = useFormContext();

  const hasErrors = errors[name] ? true : false;
  const errorMessage = hasErrors ? errors[name].message : undefined;

  const handleChange = changeEvt => {
    const changedValue = changeEvt.target.value;
    if (onChange) {
      onChange(changedValue);
    }
    setValue(name, changedValue);
  };

  React.useEffect(() => {
    register({name: name});
  }, [register, name]);

  const currentValue = watch(name);

  return (
      <>
        <FormControl fullWidth error={hasErrors}>
          <InputLabel required>{label}</InputLabel>
          <Select name={name}
                  {... other}
                  onChange={handleChange}
                  displayEmpty
                  value={currentValue}
                  inputProps={{ 'aria-label': label }}>
            {selectionOptions}
          </Select>
        </FormControl>
        { hasErrors && <FormHelperText error={hasErrors}>{errorMessage}</FormHelperText> }
      </>
  );
};
export default SelectWatchable;

