import React from 'react'
import { ListItem, ListItemText, ListItemSecondaryAction } from "@material-ui/core";
import {Meal, Time} from "@runningdinner/shared";

export interface MealItemProps extends Meal {

}

export default function MealItem({ label, time }: MealItemProps) {
  return (
      <ListItem>
        <ListItemText primary={label} />
        <ListItemSecondaryAction><Time date={time} /></ListItemSecondaryAction>
      </ListItem>

  );

}
