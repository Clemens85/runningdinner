import { AppBar, IconButton, styled, Toolbar, Typography } from "@mui/material";
import ExpandCircleDownOutlinedIcon from '@mui/icons-material/ExpandCircleDownOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { CallbackHandler } from "@runningdinner/shared";

export type TitleBarProps = {
  onToggleMinize: CallbackHandler;
  title: React.ReactNode;
}

const ToolbarSmall = styled(Toolbar)(({}) => ({
  paddingLeft: `16px ! important`,
  paddingRight: `16px ! important`,
  minHeight: '48px ! important'
}));

export function TitleBar({onToggleMinize, title}: TitleBarProps) {

  function handleShowHelp() {
    // TODO
  }

  return (
    <AppBar sx={{ position: 'relative', color: '#fff', backgroundColor: 'primary.main' }}>
      <ToolbarSmall data-testid={title}>
        <Typography variant="h6" sx={{ ml: 0, flex: 1 }}>{title}</Typography>
        <IconButton
          edge="end"
          color="inherit"
          onClick={handleShowHelp}
          aria-label="help"
          size="large">
            <HelpOutlineIcon />
        </IconButton>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onToggleMinize}
          aria-label="close"
          size="large">
            <ExpandCircleDownOutlinedIcon />
        </IconButton>
      </ToolbarSmall>
    </AppBar>
  );
}
