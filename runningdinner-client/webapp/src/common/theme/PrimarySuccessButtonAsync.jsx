import React from "react";
import {PrimaryButton} from "./PrimaryButton";
import {useAsyncCallback} from "react-async-hook";

export const PrimarySuccessButtonAsync = (props) => {

  const {size, onClick, disabled, children, ...rest} = props;

  const asyncOnClick = useAsyncCallback(onClick);

  const sizeToUse = size ? size : 'large';
  const incomingDisabled = !!disabled;

  // const labelToUse = asyncOnClick.loading ? '...' : props.children;

  return (
      <PrimaryButton disabled={incomingDisabled || asyncOnClick.loading} onClick={asyncOnClick.execute} size={sizeToUse} {...rest}>
        { children }
      </PrimaryButton>
  );
};
