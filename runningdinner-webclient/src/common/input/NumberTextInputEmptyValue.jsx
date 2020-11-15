import React, {useEffect} from 'react'
import TextField from "@material-ui/core/TextField";
import {isStringEmpty} from "../../shared/Utils";
import {useFormContext} from "react-hook-form";

function NumberTextInputEmptyValue({onChange, emptyValue, name, label, value, ...others}) {

  const handleDisplayValueChange = changeEvt => {
    const newValue = changeEvt.target.value;
    onChange(parse(newValue));
    setDisplayValue(format(newValue));
  };

  const parse = val => {
    if (isStringEmpty(val)) {
      return emptyValue;
    }
    return val;
  };

  const format = React.useCallback(val => {
    if (val <= emptyValue) {
      return '';
    }
    return val;
  }, [emptyValue]);

  const [displayValue, setDisplayValue] = React.useState(format(value));
  const { errors } = useFormContext();
  useEffect(() => {
    setDisplayValue(format(value));
  }, [value, setDisplayValue, format]);


  const hasError = errors[name] ? true : false;
  const errorText = hasError ? errors[name].message : undefined;

  return (
      <TextField label={label} error={hasError} helperText={errorText} {...others}
                 onChange={handleDisplayValueChange} value={displayValue} />
  );
}

NumberTextInputEmptyValue.defaultProps = {
  emptyValue: -1
};
export default NumberTextInputEmptyValue;
