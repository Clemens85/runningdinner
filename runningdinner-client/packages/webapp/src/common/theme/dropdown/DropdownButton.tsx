import Button, {ButtonProps} from '@material-ui/core/Button';
import React from 'react';
import {Menu} from "@material-ui/core";
import ExpandMoreOutlinedIcon from '@material-ui/icons/ExpandMoreOutlined';

export const DropdownButtonContext = React.createContext<any>({});

export interface DropdownButtonProps extends ButtonProps {
  label: React.ReactNode
}

export default function DropdownButton({variant, color, label, children, ...remainder}: DropdownButtonProps) {

  const [anchorEl, setAnchorEl] = React.useState<any>();
  const open = Boolean(anchorEl);
  // const menuRef = useRef();

  const handleOpenMenu = (event: React.MouseEvent<EventTarget>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const variantToSet = variant || "outlined";
  const colorToSet = color || "primary";

  return (
      <>
        <Button variant={variantToSet} color={colorToSet} endIcon={<ExpandMoreOutlinedIcon />} {...remainder} onClick={handleOpenMenu}>
          {label}
        </Button>
        <Menu anchorEl={anchorEl}
              // ref={menuRef}
              keepMounted
              open={open}
              onClose={handleCloseMenu}>

          <DropdownButtonContext.Provider value={{ handleCloseMenu }}>
            {children}
          </DropdownButtonContext.Provider>
        </Menu>
      </>
  );
}
