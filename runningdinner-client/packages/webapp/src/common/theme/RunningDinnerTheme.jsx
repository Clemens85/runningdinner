import { createTheme } from "@mui/material";
import { grey } from '@mui/material/colors';

export const runningDinnerTheme = createTheme({
  palette: {
    primary: {
      // main: '#6db33f'
      main: '#2e7d32'
    },
    secondary: {
      main: '#f50057'
    }
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          color: 'white',
          backgroundColor: 'black'
        }
      }
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&.Mui-selected, &.Mui-selected:hover": {
            "backgroundColor": grey["100"]
          }
        }
      }
    }
  }
});
