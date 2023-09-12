import { Alert } from '@mui/material';
import React from "react";
import {styled} from "@mui/material/styles";

const AlertCentered = styled(Alert)( {
  '& .MuiAlert-message': {
    textAlign: 'center',
    width: "100%"
  }
});
export default AlertCentered;
