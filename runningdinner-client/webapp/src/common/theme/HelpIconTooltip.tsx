import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import { styled } from '@mui/material';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => <Tooltip {...props} classes={{ popper: className }} />)(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.default,
    color: theme.palette.common.black,
    maxWidth: 220,
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: theme.palette.common.black,
  },
}));

export interface HelpIconTooltipProps extends Omit<TooltipProps, 'children'> {
  fontSize?: 'inherit' | 'medium' | 'small' | 'large';
}

export function HelpIconTooltip({ fontSize, sx, ...remainder }: HelpIconTooltipProps) {
  return (
    <HtmlTooltip {...remainder} arrow>
      <HelpOutlineOutlinedIcon fontSize={fontSize} sx={sx} />
    </HtmlTooltip>
  );
}
