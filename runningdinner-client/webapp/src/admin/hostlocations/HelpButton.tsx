import { IconButton } from '@mui/material';
import { useDisclosure } from '@runningdinner/shared';
import { DinnerRouteOverviewHelpDialog } from './DinnerRouteOverviewHelpDialog';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export function HelpButton() {
  const { open, isOpen, close } = useDisclosure();

  return (
    <>
      <IconButton edge="end" color="inherit" onClick={open} aria-label="help" size="large">
        <HelpOutlineIcon />
      </IconButton>
      {isOpen && <DinnerRouteOverviewHelpDialog onClose={close} />}
    </>
  );
}
