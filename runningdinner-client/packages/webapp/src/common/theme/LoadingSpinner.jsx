import React from "react";
import { Backdrop, CircularProgress } from "@mui/material";

import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

export default function LoadingSpinner(props) {

  const classes = useStyles();

  let show = true;
  if (typeof props.loading !== 'undefined') {
    show = props.loading;
  }

  if (!show) {
    return null;
  }
  return (
      <div>
        <Backdrop className={classes.backdrop} open={show}>
          <CircularProgress color="inherit"/>
        </Backdrop>
      </div>
  );
}
