import React from "react";
import {IconButton, Menu, MenuItem} from "@material-ui/core";
import MoreVertIcon from "@material-ui/icons/MoreVert";

export default function VerticalMenuThreeDots({entries}) {

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleEntryClicked = (entry) => {
    handleCloseMenu();
    entry.onClick();
  };

  return (
    <>
      <IconButton
          aria-label="more"
          aria-controls="menu"
          aria-haspopup="true"
          onClick={handleOpenMenu}>
        <MoreVertIcon />
      </IconButton>
      <Menu
          id="menu"
          anchorEl={anchorEl}
          keepMounted
          open={open}
          onClose={handleCloseMenu}>
        {entries.map((entry) => (
            <MenuItem key={entry.label} onClick={() => handleEntryClicked(entry)}>
              {entry.label}
            </MenuItem>
        ))}
      </Menu>
    </>
  );
}
