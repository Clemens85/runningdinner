import makeStyles from '@mui/styles/makeStyles';
import {styled} from "@mui/material/styles";
import {TableRow} from "@mui/material";

export const TableRowWithCursor = styled(TableRow)({
  cursor: "pointer"
});


const useCommonStyles = makeStyles((theme) => ({
  textAlignRight: {
    textAlign: 'right'
  },
  fullWidth: {
    width: "100%"
  },
  fullHeight: {
    height: "100%"
  },
  buttonSpacingLeft: {
    marginLeft: theme.spacing(2)
  },
  colorSecondary: {
    color: theme.palette.secondary.main
  },
  bottomBorderNone: {
    borderBottom: "none"
  }
}));

export default useCommonStyles;
