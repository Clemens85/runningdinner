import React from "react";
import {useAsyncCallback} from "react-async-hook";
import {Button} from "@mui/material";

export const PrimaryDangerButtonAsync = (props) => {

  const {size, onClick, disabled, children, ...rest} = props;

  let asyncClickHandler = onClick;
  if (!asyncClickHandler) {
    asyncClickHandler = () => {}; // Noop
  }

  const asyncOnClick = useAsyncCallback(asyncClickHandler);

  const sizeToUse = size ? size : 'large';
  const incomingDisabled = !!disabled;

  return (
      <Button variant="contained" color="secondary" disabled={incomingDisabled || asyncOnClick.loading} onClick={asyncOnClick.execute} size={sizeToUse} {...rest}>
        { children }
      </Button>
  );
};
