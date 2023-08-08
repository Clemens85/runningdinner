import MuiDialogTitle from "@mui/material/DialogTitle";
import { Typography, IconButton } from "@mui/material";
import withStyles from '@mui/styles/withStyles';
import CloseIcon from "@mui/icons-material/Close";
import React from "react";

const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

export const DialogTitleCloseable = withStyles(styles)((props) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
          <IconButton
            aria-label="close"
            className={classes.closeButton}
            onClick={onClose}
            size="large">
            <CloseIcon />
          </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});
