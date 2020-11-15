import React from "react";
import HelpOutlineOutlinedIcon from '@material-ui/icons/HelpOutlineOutlined';
import {withStyles, Tooltip} from "@material-ui/core";

const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.common.black,
    maxWidth: 220,
    // fontSize: theme.typography.pxToRem(12),
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: theme.palette.common.black
  },
}))(Tooltip);

export default function HelpIconTooltip(props) {

  const { content } = props;

  return (
    <HtmlTooltip title={content} {...props} arrow>
      <HelpOutlineOutlinedIcon />
    </HtmlTooltip>
  );
}
