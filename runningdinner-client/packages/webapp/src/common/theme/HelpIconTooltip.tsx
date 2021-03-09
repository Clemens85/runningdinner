import React from "react";
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import {withStyles, Tooltip, styled, TooltipProps} from "@material-ui/core";
import { spacing } from "@material-ui/system";

const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.common.black,
    maxWidth: 220,
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: theme.palette.common.black
  },
}))(Tooltip);

export interface HelpIconTooltipProps extends Omit<TooltipProps, "children"> {
}

function HelpHtmlTooltip(props: HelpIconTooltipProps) {

  return (
    <HtmlTooltip {...props} arrow>
      <HelpOutlineOutlinedIcon />
    </HtmlTooltip>
  );
}

export const HelpIconTooltip = styled(HelpHtmlTooltip)(spacing);
