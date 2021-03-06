import React from "react";
import {useAsyncCallback} from "react-async-hook";
import {Button} from "@material-ui/core";

export const PrimaryDangerButtonAsync = (props) => {

  let asyncClickHandler = props.onClick;
  if (!asyncClickHandler) {
    asyncClickHandler = () => {}; // Noop
  }

  const asyncOnClick = useAsyncCallback(asyncClickHandler);

  const size = props.size ? props.size : 'large';
  const disabled = !!props.disabled;

  return (
      <Button variant="contained" color="secondary" disabled={disabled || asyncOnClick.loading} onClick={asyncOnClick.execute} size={size}>
        { props.children }
      </Button>
  );
};
