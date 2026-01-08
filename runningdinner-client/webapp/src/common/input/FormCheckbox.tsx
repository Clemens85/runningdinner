import { Checkbox, CheckboxProps, FormControl, FormControlLabel, FormHelperText } from '@mui/material';
import { isStringNotEmpty } from '@runningdinner/shared';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';

export interface FormCheckboxProps extends Omit<CheckboxProps, 'defaultValue'> {
  name: string;
  label: React.ReactNode;
  helperText?: React.ReactNode;
  defaultValue?: unknown;
  useTableDisplay?: boolean;
}

export default function FormCheckbox({ name, label, helperText, defaultValue, useTableDisplay, ...rest }: FormCheckboxProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const hasErrors = !!errors[name];
  // @ts-ignore
  const errorMessage = hasErrors ? errors[name].message : undefined;
  const helperTextToDisplay = (hasErrors ? errorMessage : helperText) as string;

  return (
    <FormControl variant="standard" error={hasErrors}>
      <Controller
        defaultValue={defaultValue}
        name={name}
        control={control}
        render={({ field }) => (
          <FormControlLabel
            label={label}
            style={useTableDisplay ? { display: 'table' } : {}}
            control={
              <div style={{ display: useTableDisplay ? 'table-cell' : 'inline' }}>
                <Checkbox color="primary" {...rest} onChange={(evt: React.ChangeEvent<HTMLInputElement>) => field.onChange(evt.target.checked)} checked={field.value} />
              </div>
            }
          />
        )}
      />
      {isStringNotEmpty(helperTextToDisplay) && <FormHelperText error={hasErrors}>{helperTextToDisplay}</FormHelperText>}
    </FormControl>
  );
}
