import React from 'react';

import { Controller, useFormContext } from 'react-hook-form';
import { TimePicker, TimePickerProps } from '@mui/x-date-pickers/TimePicker';
import { FormHelperText } from '@mui/material';
import { isStringNotEmpty } from '@runningdinner/shared';

export interface FormTimePickerProps extends Partial<TimePickerProps<any>> {
  name: string;
  label: string;
  helperText?: string;
  defaultValue?: unknown;
}

export default function FormTimePicker({ name, label, helperText, defaultValue, ...other }: FormTimePickerProps) {
  const {
    formState: { errors },
    control,
  } = useFormContext();

  const errorMessage = (isStringNotEmpty(name) ? errors[name]?.message : '') as string;
  const hasErrors = isStringNotEmpty(errorMessage);
  const helperTextToDisplay = hasErrors ? errorMessage : helperText;

  return (
    <>
      <Controller
        name={name}
        defaultValue={defaultValue}
        control={control}
        render={({ field }) => (
          <>
            <TimePicker {...field} {...other} ampm={false} label={label} slotProps={{ textField: { error: hasErrors, variant: 'outlined', id: name } }} />
            {isStringNotEmpty(helperTextToDisplay) && <FormHelperText error={hasErrors}>{helperTextToDisplay}</FormHelperText>}
          </>
        )}
      />
    </>
  );
}
