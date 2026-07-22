import React from 'react';
import { Typography, Divider, Box } from '@mui/material';

export default function FormFieldset(props) {
  return (
    <Box sx={{
      mb: 2
    }}>
      <Typography variant="subtitle1">{props.children}</Typography>
      <Divider />
    </Box>
  );
}
