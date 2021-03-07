import React from 'react';
import {Controller, useFormContext} from "react-hook-form";
import {KeyboardDatePicker} from "@material-ui/pickers";
import {FormHelperText} from "@material-ui/core";
import {KeyboardDatePickerProps} from "@material-ui/pickers/DatePicker/DatePicker";
import {isStringNotEmpty} from "@runningdinner/shared";
import useDatePickerLocale from "../date/DatePickerLocaleHook";

export interface FormDatePickerProps extends Partial<KeyboardDatePickerProps> {
  name: string;
  label: string;
  helperText?: string;
}

export default function FormDatePicker({name, label, helperText, ...other}: FormDatePickerProps) {

  const {errors, control} = useFormContext();
  const { dateFormat } = useDatePickerLocale();

  const errorMessage = isStringNotEmpty(name) ? errors[name]?.message : "";
  const hasErrors = isStringNotEmpty(errorMessage);
  const helperTextToDisplay = hasErrors ? errorMessage : helperText;

  return (
      <>
        <Controller
            name={name}
            control={control}
            render={({ref, ...remainder}) =>
                <>
                  <KeyboardDatePicker
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
