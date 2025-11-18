import { Button } from '@mui/material';
import React from 'react';
import { styled } from '@mui/material/styles';
import { spacing } from '@mui/system';
import { Link as RouterLink } from 'react-router-dom';

// The `withStyles()` higher-order component is injecting a `classes`
// prop that is used by the `Button` component.
// export const PrimaryButton = withStyles({
//   root: {
//     color: 'white',
//   }/*,
//   label: {
//     textTransform: 'capitalize',
//   },*/
// })(Button);

// const PrimaryButtonStyled = withStyles(theme => ({
//   root: {
//     color: 'white',
//     // backgroundColor: theme.palette.primary.main
//   }
// }))(Button);

const PrimaryButtonInternal = (props) => {
  return (
    <Button color="success" variant="contained" {...props}>
      {props.children}
    </Button>
  );
};

const PrimaryRouterButtonInternal = (props) => {
  const { to, ...rest } = props;
  return (
    <Button color="success" variant="contained" to={to} component={RouterLink} {...rest}>
      {props.children}
    </Button>
  );
};

export const PrimaryButton = styled(PrimaryButtonInternal)(spacing);
export const PrimaryRouterButton = styled(PrimaryRouterButtonInternal)(spacing);
