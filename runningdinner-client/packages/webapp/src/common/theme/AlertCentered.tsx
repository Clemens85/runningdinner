import makeStyles from '@mui/styles/makeStyles';
import { Alert } from '@mui/material';
import { AlertProps } from '@mui/lab';
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
