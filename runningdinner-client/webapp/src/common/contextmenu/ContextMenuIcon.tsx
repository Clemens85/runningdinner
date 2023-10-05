import React from "react";
import {IconButton, Menu, MenuItem} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {CallbackHandler, isStringNotEmpty} from "@runningdinner/shared";

export interface ContextMenuIconProps {
  entries: ContextMenuEntry[];
  dataTestId?: string;
}

export interface ContextMenuEntry {
  label: string;
  onClick: CallbackHandler;
}

export default function ContextMenuIcon({entries, dataTestId}: ContextMenuIconProps) {

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleEntryClicked = (entry: ContextMenuEntry) => {
    handleCloseMenu();
    entry.onClick();
  };

  return <>
    <IconButton
      aria-label="more"
      aria-controls="menu"
      aria-haspopup="true"
      onClick={handleOpenMenu}
      data-testid={isStringNotEmpty(dataTestId) ? dataTestId : ""}
      size="large">
      <MoreVertIcon />
    </IconButton>
    <Menu
        id="menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleCloseMenu}>
      {entries.map((entry) => (
          <MenuItem key={entry.label} onClick={() => handleEntryClicked(entry)} data-testid={`context-menu-entry-${entry.label}`}>
            {entry.label}
          </MenuItem>
      ))}
    </Menu>
  </>;
}
