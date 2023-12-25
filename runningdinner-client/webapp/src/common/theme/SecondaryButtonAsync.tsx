import {Button, ButtonProps} from "@mui/material";
import { useAsyncCallback } from "@runningdinner/shared";



export const SecondaryButtonAsync = ({onClick, size, disabled, children, ...remainder}: ButtonProps) => {

  let asyncClickHandler = onClick;
  if (!asyncClickHandler) {
    asyncClickHandler = () => {}; // Noop
  }

  const asyncOnClick = useAsyncCallback(asyncClickHandler);

  const sizeToUse = size ? size : 'large';
  const initialDisabled = !!disabled;

  return (
      <Button disabled={initialDisabled || asyncOnClick.loading} onClick={asyncOnClick.execute} size={sizeToUse} {...remainder}>
        { children }
      </Button>
  );
};
