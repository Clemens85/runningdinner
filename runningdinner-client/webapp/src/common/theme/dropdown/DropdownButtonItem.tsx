import {MenuItem, MenuItemProps} from "@mui/material";
import { DropdownButtonContext } from './DropdownButton';

export default function DropdownButtonItem({onClick, ...remainder}: MenuItemProps) {

  return (
    <DropdownButtonContext.Consumer>
      {({ handleCloseMenu: closeMenu }) => (
          // @ts-ignore
          <MenuItem
              onClick={(evt) => {
                closeMenu();
                if (onClick) {
                  onClick(evt);
                }
              }}
              // ref={menuRef}
              {...remainder} />
      )}
    </DropdownButtonContext.Consumer>

  );
}
