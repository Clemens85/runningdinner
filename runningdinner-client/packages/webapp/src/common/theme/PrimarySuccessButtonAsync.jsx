import React from "react";
import {PrimaryButton} from "./PrimaryButton";
import {useAsyncCallback} from "react-async-hook";

export const PrimarySuccessButtonAsync = (props) => {

  const {onClick} = props;
  const asyncOnClick = useAsyncCallback(onClick);

  const size = props.size ? props.size : 'large';
  const disabled = !!props.disabled;

  // const labelToUse = asyncOnClick.loading ? '...' : props.children;

  return (
      <PrimaryButton disabled={disabled || asyncOnClick.loading} onClick={asyncOnClick.execute} size={size}>
        { props.children }
      </PrimaryButton>
  );
};
