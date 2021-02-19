import React, {useEffect} from 'react'
import TextField from "@material-ui/core/TextField";
import {CallbackHandler, isStringEmpty} from "@runningdinner/shared";
import {useFormContext} from "react-hook-form";
import { BaseTextFieldProps } from '@material-ui/core';

export interface NumberTextInputEmptyValueProps extends BaseTextFieldProps {
  onChange: CallbackHandler,
  emptyValue: number;
  name: string;
  label: string;
  value: string;
}

export const NumberTextInputEmptyValue = React.forwardRef(({onChange, emptyValue = -1, name, label, value, ...others}: NumberTextInputEmptyValueProps, ref) => {

  const handleDisplayValueChange = (changeEvt: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = changeEvt.target.value;
    onChange(parse(newValue));
    setDisplayValue(format(newValue));
  };

  const parse = (val: string | undefined) => {
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
      <TextField label={label}
                 error={hasError}
                 helperText={errorText}
                 innerRef={ref}
                 {...others}
                 onChange={handleDisplayValueChange}
                 value={displayValue} />
  );
});