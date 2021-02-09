import MuiDialogTitle from "@material-ui/core/DialogTitle";
import { Typography, IconButton, withStyles } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
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
            <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
              <CloseIcon />
            </IconButton>
        ) : null}
      </MuiDialogTitle>
  );
});
