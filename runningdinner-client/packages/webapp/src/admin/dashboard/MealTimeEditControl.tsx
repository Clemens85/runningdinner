import React from 'react'
import {KeyboardTimePicker} from "@material-ui/pickers";
import {CallbackHandler, Meal} from "@runningdinner/shared";

export interface MealTimeEditControlProps extends Meal {
  onHandleTimeChange: CallbackHandler
  dataTestId?: string;
}

export default function MealTimeEditControl({id, label, time, dataTestId, onHandleTimeChange}: MealTimeEditControlProps) {

  return (
      <KeyboardTimePicker
          margin="normal"
          ampm={false}
          id={id}
          label={label}
          value={time}
          data-testid={dataTestId}
          onChange={onHandleTimeChange}
          KeyboardButtonProps={{
            'aria-label': 'change time',
          }}/>
  );

}
