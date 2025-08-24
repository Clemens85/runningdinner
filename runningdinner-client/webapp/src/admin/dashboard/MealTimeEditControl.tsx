import { SxProps } from '@mui/system';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { CallbackHandler, Meal } from '@runningdinner/shared';

export interface MealTimeEditControlProps extends Meal {
  onHandleTimeChange: CallbackHandler;
  sx?: SxProps;
}

export default function MealTimeEditControl({ label, time, onHandleTimeChange, sx }: MealTimeEditControlProps) {
  return <TimePicker sx={sx} ampm={false} label={label} value={time} slotProps={{ textField: { variant: 'outlined', id: `meal-time-${label}` } }} onChange={onHandleTimeChange} />;
}
