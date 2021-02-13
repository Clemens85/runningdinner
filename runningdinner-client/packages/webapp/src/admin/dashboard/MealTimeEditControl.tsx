import React from 'react'
import {KeyboardTimePicker} from "@material-ui/pickers";
import {CallbackHandler, Meal} from "@runningdinner/shared";

export interface MealTimeEditControlProps extends Meal {
  onHandleTimeChange: CallbackHandler
}

export default function MealTimeEditControl({id, label, time, onHandleTimeChange}: MealTimeEditControlProps) {

  return (
      <KeyboardTimePicker
          margin="normal"
          id={id}
          label={label}
          value={time}
          onChange={onHandleTimeChange}
          KeyboardButtonProps={{
            'aria-label': 'change time',
          }}/>
  );

}
