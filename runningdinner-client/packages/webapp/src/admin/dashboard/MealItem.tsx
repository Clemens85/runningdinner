import React from 'react'
import { ListItem, ListItemText, ListItemSecondaryAction } from "@mui/material";
import {Meal, Time} from "@runningdinner/shared";

export interface MealItemProps extends Meal {

}

export default function MealItem({ label, time }: MealItemProps) {
  return (
      <ListItem data-testid={`meal-item`}>
        <ListItemText primary={label} />
        <ListItemSecondaryAction><Time date={time} /></ListItemSecondaryAction>
      </ListItem>

  );

}
