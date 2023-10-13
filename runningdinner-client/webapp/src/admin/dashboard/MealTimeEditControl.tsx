import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import {CallbackHandler, Meal} from "@runningdinner/shared";

export interface MealTimeEditControlProps extends Meal {
  onHandleTimeChange: CallbackHandler
}

export default function MealTimeEditControl({label, time, onHandleTimeChange}: MealTimeEditControlProps) {

  return (
      <TimePicker
          ampm={false}
          label={label}
          value={time}
          slotProps={{textField: { variant: 'outlined', id: `meal-time-${label}` } }}
          onChange={onHandleTimeChange} />
  );

}
