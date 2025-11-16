import MuiDialogTitle from '@mui/material/DialogTitle';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

export const DialogTitleCloseable = (props) => {
  const { children, onClose, ...other } = props;
  return (
    <MuiDialogTitle sx={{ m: 0, p: 2 }} {...other}>
      <>{children}</>
      {onClose ? (
        <IconButton sx={{ position: 'absolute', right: 2, top: 1, color: 'grey.dark' }} aria-label="close" onClick={onClose} size="large">
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
};
