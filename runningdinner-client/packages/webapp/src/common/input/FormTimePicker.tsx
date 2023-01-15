import React from 'react';

import {Controller, useFormContext} from "react-hook-form";
import {KeyboardTimePicker, KeyboardTimePickerProps} from "@material-ui/pickers";
import {FormHelperText} from "@material-ui/core";
import {isStringNotEmpty} from "@runningdinner/shared";

export interface FormTimePickerProps extends Partial<KeyboardTimePickerProps> {
  name: string;
  label: string;
  helperText?: string;
  defaultValue?: unknown;
}

export default function FormTimePicker({name, label, helperText, defaultValue, ...other}: FormTimePickerProps) {

  const {errors, control} = useFormContext();

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
            <KeyboardTimePicker
              {...Object.assign({}, remainder, other)}
              ampm={false}
              error={hasErrors}
              autoOk={false}
              id={name}
              label={label}
              onChange={(newDate) => remainder.onChange(newDate)}
              invalidDateMessage={"Ungültige Zeit"}
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
