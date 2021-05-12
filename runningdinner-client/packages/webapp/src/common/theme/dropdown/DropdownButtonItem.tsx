import React from 'react';
import {MenuItem, MenuItemProps} from "@material-ui/core";
import { DropdownButtonContext } from './DropdownButton';

// export interface DropdownButtonItemProps extends MenuItemProps {
//
// }

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
