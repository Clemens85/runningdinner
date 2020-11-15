import Typography from "@material-ui/core/Typography";
import React from "react";
import Box from "@material-ui/core/Box";

export default function MessageHeadline() {

  return (
      <Box mt={2} mb={1}>
        <Typography variant="h5" gutterBottom>Nachricht</Typography>
      </Box>
  );

}
