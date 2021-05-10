import AddIcon from "@material-ui/icons/Add";
import React from "react";
import {makeStyles, Fab} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  createParticipantButton: {
    margin: 0,
    top: 'auto',
    left: 'auto',
    bottom: 20,
    right: 20,
    position: 'fixed',
    color: 'white'
  }
}));

export const StickyActionButton = ({onClick}) => {
  const classes = useStyles();
  return (
      <Fab color="primary" aria-label="add" className={classes.createParticipantButton} onClick={onClick}>
        <AddIcon />
      </Fab>
  );
};
