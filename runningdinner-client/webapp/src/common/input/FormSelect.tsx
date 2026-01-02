import { FormControl, FormHelperText, InputLabel, Select, SelectProps, styled } from '@mui/material';
import { spacing } from '@mui/system';
import { isStringNotEmpty } from '@runningdinner/shared';
import { ReactNode } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

export interface SelectWatchableProps extends Omit<SelectProps, 'variant'> {
  name: string;
  label: string;
  helperText?: string;
  defaultValue?: unknown;
  children?: ReactNode;
  variant?: 'standard' | 'outlined' | 'filled';
}

function FormSelectInternal({ name, label, children, helperText, fullWidth = true, variant = 'outlined', defaultValue, ...other }: SelectWatchableProps) {
  const {
    formState: { errors },
    control,
  } = useFormContext();

  const errorMessage = isStringNotEmpty(name) ? errors[name]?.message : '';
  const hasErrors = isStringNotEmpty(errorMessage as string);
  const helperTextToDisplay = (hasErrors ? errorMessage : helperText) as string;

  return (
    <>
      <Controller
        name={name}
        defaultValue={defaultValue}
        control={control}
        render={({ field }) => (
          <>
            <FormControl fullWidth={fullWidth} error={hasErrors} variant={variant}>
              <InputLabel required>{label}</InputLabel>
              <Select {...field} {...other} label={label} variant={variant} inputProps={{ 'aria-label': label }}>
                {children}
              </Select>
            </FormControl>
            {isStringNotEmpty(helperTextToDisplay) && <FormHelperText error={hasErrors}>{helperTextToDisplay}</FormHelperText>}
          </>
        )}
      />
    </>
  );
}

const FormSelect = styled(FormSelectInternal)(spacing);
export default FormSelect;
