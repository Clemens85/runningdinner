import React from "react";
import { Typography, Divider, Box } from "@material-ui/core";

export default function FormFieldset(props) {
  return (
      <Box mb={2}>
        <Typography variant="subtitle1">{props.children}</Typography>
        <Divider />
      </Box>
  );
}
