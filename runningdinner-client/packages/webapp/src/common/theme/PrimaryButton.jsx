import {withStyles, Button} from '@material-ui/core';
import React from "react";
import {styled} from "@material-ui/core/styles";
import {spacing} from "@material-ui/system";

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

export const PrimaryButton = styled(PrimaryButtonInternal)(spacing);
