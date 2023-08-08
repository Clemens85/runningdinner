import React from 'react'
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import {CallbackHandler, Meal} from "@runningdinner/shared";

export interface MealTimeEditControlProps extends Meal {
  onHandleTimeChange: CallbackHandler
}

export default function MealTimeEditControl({id, label, time, onHandleTimeChange}: MealTimeEditControlProps) {

  return (
      <TimePicker
          ampm={false}
          id={id}
          label={label}
          value={time}
          data-testid={`meal-time-${label}`}
          onChange={onHandleTimeChange}
          KeyboardButtonProps={{
            'aria-label': 'change time',
          }}/>
  );

}
