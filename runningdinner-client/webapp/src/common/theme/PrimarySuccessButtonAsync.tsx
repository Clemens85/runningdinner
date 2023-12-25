import { useAsyncCallback } from "@runningdinner/shared";
import {PrimaryButton} from "./PrimaryButton";
import { ButtonProps } from "@mui/material";

export const PrimarySuccessButtonAsync = (props: ButtonProps) => {

  const {size, onClick, disabled, children, ...rest} = props;

  let asyncClickHandler = onClick;
  if (!asyncClickHandler) {
    asyncClickHandler = () => {}; // Noop
  }

  const asyncOnClick = useAsyncCallback(asyncClickHandler);

  const sizeToUse = size ? size : 'large';
  const incomingDisabled = !!disabled;

  return (
      <PrimaryButton disabled={incomingDisabled || asyncOnClick.loading} onClick={asyncOnClick.execute} size={sizeToUse} {...rest}>
        { children }
      </PrimaryButton>
  );
};
