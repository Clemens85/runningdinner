import React from 'react';
import { Switch } from '@material-ui/core';
import { useCustomSwitchStyles } from './customSwitch.styles';

const CustomSwitch = ({checked, onChange}) => {

  const customStyles = useCustomSwitchStyles();
  return (
      <>
        <Switch
            classes={customStyles}
            checked={checked}
            onChange={e => onChange(e.target.checked)}/>
      </>
  );
};
CustomSwitch.defaultProps = {
  checked: false
};
export default CustomSwitch;

