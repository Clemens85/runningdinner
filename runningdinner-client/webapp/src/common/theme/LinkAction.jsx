import { Link } from '@mui/material';
import React from 'react';

export default function LinkAction(props) {
  const { onClick, ...remainder } = props;
  return (
    <Link component="button" onClick={onClick} sx={{ textTransform: 'uppercase' }} {...remainder} underline="hover">
      {props.children}
    </Link>
  );
}
