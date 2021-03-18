import {makeStyles} from "@material-ui/core";
import {Alert, AlertProps} from "@material-ui/lab";
import React from "react";

const useAlertStyles = makeStyles(() => ({
  message: {
    textAlign: 'center',
    width: "100%"
  }
}));

export default function AlertCentered(props: AlertProps) {
  const styles = useAlertStyles();
  return (
    <Alert {...props} classes={{ message: styles.message }} />
  );
}
