import {useAsyncCallback} from "react-async-hook";
import {Button} from "@mui/material";
import React from "react";

export const SecondaryButtonAsync = (props) => {

  let asyncClickHandler = props.onClick;
  if (!asyncClickHandler) {
    asyncClickHandler = () => {}; // Noop
  }

  const asyncOnClick = useAsyncCallback(asyncClickHandler);

  const size = props.size ? props.size : 'large';
  const disabled = !!props.disabled;

  return (
      <Button disabled={disabled || asyncOnClick.loading} onClick={asyncOnClick.execute} size={size} {...props}>
        { props.children }
      </Button>
  );
};
