import {createMuiTheme} from "@material-ui/core";
import { grey } from '@material-ui/core/colors';

export const runningDinnerTheme = createMuiTheme({
  palette: {
    primary: {
      main: '#6db33f'
    }
  },
  overrides: {
    MuiAppBar: {
      root: {
        color: 'white',
        backgroundColor: 'black'
      }
    },
    MuiTableRow: {
      root: {
        "&.Mui-selected, &.Mui-selected:hover": {
          "backgroundColor": grey["100"]
        }
      }
    }
  }
});
