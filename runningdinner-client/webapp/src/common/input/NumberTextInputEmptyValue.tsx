import { BaseTextFieldProps } from '@mui/material';
import TextField from '@mui/material/TextField';
import { CallbackHandler, isInteger, isStringEmpty } from '@runningdinner/shared';
import { parseInt } from 'lodash-es';
import React, { useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

export interface NumberFormTextFieldEmptyValueAllowedProps extends BaseTextFieldProps {
  emptyValue: number;
  name: string;
  label: string;
}

export interface NumberTextInputEmptyValueProps extends NumberFormTextFieldEmptyValueAllowedProps {
  onChange: CallbackHandler;
  value: string;
}

export function NumberFormTextFieldEmptyValueAllowed(props: NumberFormTextFieldEmptyValueAllowedProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const { name, label, required, defaultValue, emptyValue } = props;

  const hasErrors = !!errors[name];

  let helperText = props.helperText;
  if (hasErrors) {
    helperText = errors[name]?.message as string;
  }

  return (
    <Controller
      name={name}
      control={control}
      defaultValue={defaultValue}
      render={({ field }) => (
        <NumberTextInputEmptyValue
          variant="filled"
          name={name}
          required={required}
          label={label}
          onChange={(newVal) => field.onChange(newVal)}
          value={field.value}
          helperText={helperText}
          error={hasErrors}
          emptyValue={emptyValue}
          fullWidth
        />
      )}
    />
  );
}

const NumberTextInputEmptyValue = React.forwardRef(({ onChange, emptyValue = -1, name, label, helperText, value, ...others }: NumberTextInputEmptyValueProps, ref) => {
  const handleDisplayValueChange = (changeEvt: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = changeEvt.target.value;
    onChange(parse(newValue));
    // @ts-ignore
    setDisplayValue(format(newValue));
  };

  const parse = (val: string | undefined) => {
    if (isStringEmpty(val)) {
      return emptyValue;
    } else if (!isInteger(val)) {
      return emptyValue;
    }
    return val;
  };

  const format = React.useCallback(
    (val: number | string | undefined) => {
      if (val === undefined) {
        return '';
      }
      const valAsStr = val + '';
      if (!isInteger(valAsStr)) {
        return '';
      }
      const valAsInt = parseInt(valAsStr);
      if (valAsInt <= emptyValue) {
        return '';
      }
      // if (val typeof number && val <= emptyValue) {
      //   return '';
      // }
      // if (val typeof string && !isInteger(val)) {
      //   return '';
      // }
      // if (val === undefined || val <= emptyValue || !isInteger(val as string)) {
      //   return '';
      // }
      return val;
    },
    [emptyValue],
  );

  // @ts-ignore
  const [displayValue, setDisplayValue] = React.useState(format(value));
  // const { errors } = useFormContext();
  useEffect(() => {
    // @ts-ignore
    setDisplayValue(format(value));
  }, [value, setDisplayValue, format]);

  // const hasError = errors[name] ? true : false;
  // const errorText = hasError ? errors[name].message : undefined;

  return (
    <TextField
      variant="standard"
      label={label}
      // error={hasError}
      helperText={helperText}
      inputRef={ref as React.ForwardedRef<HTMLDivElement>}
      name={name}
      {...others}
      onChange={handleDisplayValueChange}
      value={displayValue}
    />
  );
});
