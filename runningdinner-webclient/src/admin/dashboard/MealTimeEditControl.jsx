import React from 'react'
import {KeyboardTimePicker} from "@material-ui/pickers";

export default function MealTimeEditControl({id, label, time, onHandleTimeChange}) {

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
