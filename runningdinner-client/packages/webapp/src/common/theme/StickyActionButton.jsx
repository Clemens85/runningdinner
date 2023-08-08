import AddIcon from "@mui/icons-material/Add";
import React from "react";
import { Fab } from "@mui/material";

import makeStyles from '@mui/styles/makeStyles';

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
