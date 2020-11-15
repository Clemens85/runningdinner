import { withStyles, Paper } from '@material-ui/core';

// The `withStyles()` higher-order component is injecting a `classes`
// prop that is used by the `Button` component.
export const PaperGrey = withStyles({
  root: {
    backgroundColor: '#eee',
  }
})(Paper);
