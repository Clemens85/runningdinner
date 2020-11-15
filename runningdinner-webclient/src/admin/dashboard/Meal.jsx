import React from 'react'
import Time from "../../shared/date/Time";
import { ListItem, ListItemText, ListItemSecondaryAction } from "@material-ui/core";

export default function Meal({ meal }) {
  return (
      <ListItem>
        <ListItemText primary={meal.label} />
        <ListItemSecondaryAction><Time date={meal.time} /></ListItemSecondaryAction>
      </ListItem>

  );

}
