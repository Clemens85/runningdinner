import { Paper } from '@mui/material';

import withStyles from '@mui/styles/withStyles';

// The `withStyles()` higher-order component is injecting a `classes`
// prop that is used by the `Button` component.
export const PaperGrey = withStyles({
  root: {
    backgroundColor: '#eee',
  }
})(Paper);
