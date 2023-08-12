import { createTheme, adaptV4Theme } from "@mui/material";
import { grey } from '@mui/material/colors';

export const runningDinnerTheme = createTheme(adaptV4Theme({
  palette: {
    primary: {
      // main: '#6db33f'
      main: '#2e7d32'
    },
    secondary: {
      main: '#f50057'
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
}));
