import { FormHelperText } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { isStringNotEmpty } from '@runningdinner/shared';
import { Controller, useFormContext } from 'react-hook-form';

import useDatePickerLocale from '../date/DatePickerLocaleHook';

export interface FormDatePickerProps {
  name: string;
  label: string;
  helperText?: string;
  defaultValue?: Date | null;
  disabled?: boolean;
  readOnly?: boolean;
  format?: string;
  slotProps?: any;
}

export default function FormDatePicker({ name, label, helperText, defaultValue, ...other }: FormDatePickerProps) {
  const {
    formState: { errors },
    control,
  } = useFormContext();
  const { dateFormat } = useDatePickerLocale();

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
            <DatePicker
              // {...Object.assign({}, remainder, other)}
              {...field}
              {...other}
              // error={hasErrors}
              // variant="inline"
              format={dateFormat}
              label={label}
              // invalidDateMessage={"Ungültiges Datum"}
              slotProps={{ textField: { error: hasErrors, variant: 'outlined', id: name, name: name } }}
            />
            {isStringNotEmpty(helperTextToDisplay) && <FormHelperText error={hasErrors}>{helperTextToDisplay}</FormHelperText>}
          </>
        )}
      />
    </>
  );
}
