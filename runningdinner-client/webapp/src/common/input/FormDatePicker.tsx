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
  defaultValue?: Date | null;
}

export default function FormDatePicker({name, label, helperText, defaultValue, ...other}: FormDatePickerProps) {

  const {formState: {errors}, control} = useFormContext();
  const { dateFormat } = useDatePickerLocale();

  const errorMessage = (isStringNotEmpty(name) ? errors[name]?.message : "") as string;
  const hasErrors = isStringNotEmpty(errorMessage);
  const helperTextToDisplay = hasErrors ? errorMessage : helperText;

  return (
      <>
        <Controller
            name={name}
            defaultValue={defaultValue}
            control={control}
            render={({field}) =>
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
                      slotProps={{textField: { error: hasErrors, variant: 'outlined', id: name } }}
                  />
                  { isStringNotEmpty(helperTextToDisplay) && <FormHelperText error={hasErrors}>{helperTextToDisplay}</FormHelperText> }
                </>
            }
        />
      </>
  );
}
