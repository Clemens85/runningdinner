import React from 'react';
import {Box, styled} from '@mui/material';
import {spacing} from "@mui/system";

export interface FormTextFieldHelpIconProps {
  formTextField: React.ReactNode;
  helpIconTooltip: React.ReactNode;
}

function FormTextFieldHelpIcon({formTextField, helpIconTooltip}: FormTextFieldHelpIconProps) {
  return (
      <div style={{display: 'flex', alignItems: 'center'}}>
        {formTextField}
        <Box pl={1}>
          {helpIconTooltip}
        </Box>
      </div>
  );
}

export default styled(FormTextFieldHelpIcon)(spacing);
