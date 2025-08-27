import { IconButton } from '@mui/material';
import { DinnerRouteOverviewActionType, useDinnerRouteOverviewContext, useDisclosure } from '@runningdinner/shared';
import { DinnerRouteOverviewHelpDialog } from './DinnerRouteOverviewHelpDialog';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

export function HelpButton() {
  // const { open, isOpen, close } = useDisclosure();

  const { dispatch } = useDinnerRouteOverviewContext();

  const openHelpDialog = () => {
    dispatch({
      type: DinnerRouteOverviewActionType.TOGGLE_HELP_DIALOG,
    });
  };

  return (
    <>
      <IconButton edge="end" color="inherit" onClick={openHelpDialog} aria-label="help" size="large">
        <HelpOutlineIcon />
      </IconButton>
      {/* {isOpen && <DinnerRouteOverviewHelpDialog onClose={close} />} */}
    </>
  );
}
