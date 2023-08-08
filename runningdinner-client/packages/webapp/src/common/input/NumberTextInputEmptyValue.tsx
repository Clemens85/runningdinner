import React, {useEffect} from 'react'
import TextField from "@mui/material/TextField";
import {CallbackHandler, isStringEmpty} from "@runningdinner/shared";
import {Controller, useFormContext} from "react-hook-form";
import { BaseTextFieldProps } from '@mui/material';


export interface NumberFormTextFieldEmptyValueAllowedProps extends BaseTextFieldProps {
  emptyValue: number;
  name: string;
  label: string;
}

export interface NumberTextInputEmptyValueProps extends BaseTextFieldProps {
  onChange: CallbackHandler,
  emptyValue: number;
  name: string;
  label: string;
  value: string;
}

export function NumberFormTextFieldEmptyValueAllowed(props: NumberFormTextFieldEmptyValueAllowedProps) {

  const {control, errors} = useFormContext();

  const {name, label, required, defaultValue} = props;

  const hasErrors = !!errors[name];

  let helperText = props.helperText;
  if (hasErrors) {
    helperText = errors[name].message;
  }

  return (
    <Controller
      name={name}
      error={hasErrors}
      helperText={helperText}
      label={label}
      control={control}
      defaultValue={defaultValue}
      render={controllerProps =>
        <NumberTextInputEmptyValue
          variant="filled"
          name={name}
          required={required}
          label={label}
          onChange={newVal => controllerProps.onChange(newVal)}
          value={controllerProps.value}
          helperText={helperText}
          emptyValue={0}
          fullWidth />
      }
    />
  );
}

const NumberTextInputEmptyValue = React.forwardRef(({onChange, emptyValue = -1, name, label, helperText, value, ...others}: NumberTextInputEmptyValueProps, ref) => {

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
  // const errorText = hasError ? errors[name].message : undefined;

  return (
      <TextField
                 label={label}
                 error={hasError}
                 helperText={helperText}
                 innerRef={ref}
                 name={name}
                 {...others}
                 onChange={handleDisplayValueChange}
                 value={displayValue} />
  );
});