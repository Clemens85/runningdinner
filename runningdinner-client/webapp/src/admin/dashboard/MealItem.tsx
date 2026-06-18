import { ListItem, ListItemSecondaryAction, ListItemText } from '@mui/material';
import { Meal, Time } from '@runningdinner/shared';

export type MealItemProps = Meal;

export default function MealItem({ label, time }: MealItemProps) {
  return (
    <ListItem data-testid={`meal-item`}>
      <ListItemText primary={label} />
      <ListItemSecondaryAction>
        <Time date={time} />
      </ListItemSecondaryAction>
    </ListItem>
  );
}
