import React from 'react';
import {Controller, useFormContext} from "react-hook-form";
import {DatePicker, DatePickerProps} from "@mui/x-date-pickers/DatePicker";
import {FormHelperText} from "@mui/material";
import {isStringNotEmpty} from "@runningdinner/shared";
import useDatePickerLocale from "../date/DatePickerLocaleHook";

export interface FormDatePickerProps extends Partial<DatePickerProps<Date>> {
  name: string;
  label: string;
  helperText?: string;
  defaultValue?: unknown;
}

export default function FormDatePicker({name, label, helperText, defaultValue, ...other}: FormDatePickerProps) {

  const {errors, control} = useFormContext();
  const { dateFormat } = useDatePickerLocale();

  const errorMessage = isStringNotEmpty(name) ? errors[name]?.message : "";
  const hasErrors = isStringNotEmpty(errorMessage);
  const helperTextToDisplay = hasErrors ? errorMessage : helperText;

  return (
      <>
        <Controller
            name={name}
            defaultValue={defaultValue}
            control={control}
            render={({ref, ...remainder}) =>
                <>
                  <DatePicker
                      {...Object.assign({}, remainder, other)}
                      autoOk
                      disableToolbar
                      error={hasErrors}
                      variant="inline"
                      format={dateFormat}
                      id={name}
                      label={label}
                      onChange={(newDate) => remainder.onChange(newDate)}
                      invalidDateMessage={"Ungültiges Datum"}
                      KeyboardButtonProps={{
                        'aria-label': label,
                      }}
                  />
                  { isStringNotEmpty(helperTextToDisplay) && <FormHelperText error={hasErrors}>{helperTextToDisplay}</FormHelperText> }
                </>
            }
        />
      </>
  );
}
