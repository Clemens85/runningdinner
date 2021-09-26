import {withStyles, Button} from '@material-ui/core';
import React from "react";
import {styled} from "@material-ui/core/styles";
import {spacing} from "@material-ui/system";
import {Link as RouterLink} from "react-router-dom";

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


const PrimaryButtonStyled = withStyles(theme => ({
  root: {
    color: 'white',
    // backgroundColor: theme.palette.primary.main
  }
}))(Button);

const PrimaryButtonInternal = (props) => {
  return <PrimaryButtonStyled color="primary" variant="contained" {...props}>{props.children}</PrimaryButtonStyled>
};

const PrimaryRouterButtonInternal = (props) => {
  const {to, ...rest} = props;
  return <PrimaryButtonStyled color="primary" variant="contained" to={to} component={RouterLink} {...rest}>{props.children}</PrimaryButtonStyled>
}

export const PrimaryButton = styled(PrimaryButtonInternal)(spacing);
export const PrimaryRouterButton = styled(PrimaryRouterButtonInternal)(spacing);