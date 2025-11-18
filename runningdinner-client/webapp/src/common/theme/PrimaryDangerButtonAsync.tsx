import { Button, ButtonProps } from '@mui/material';
import { useAsyncCallback } from '@runningdinner/shared';

export const PrimaryDangerButtonAsync = (props: ButtonProps) => {
  const { size, onClick, disabled, children, ...rest } = props;

  let asyncClickHandler = onClick;
  if (!asyncClickHandler) {
    asyncClickHandler = () => {}; // Noop
  }

  const asyncOnClick = useAsyncCallback(asyncClickHandler);

  const sizeToUse = size ? size : 'large';
  const incomingDisabled = !!disabled;

  return (
    <Button variant="contained" color="secondary" disabled={incomingDisabled || asyncOnClick.loading} onClick={asyncOnClick.execute} size={sizeToUse} {...rest}>
      {children}
    </Button>
  );
};
