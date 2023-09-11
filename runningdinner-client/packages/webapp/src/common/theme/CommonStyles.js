import makeStyles from '@mui/styles/makeStyles';
import {styled} from "@mui/material/styles";
import {Paper, TableCell, TableRow} from "@mui/material";

export const TableRowWithCursor = styled(TableRow)({
  cursor: "pointer"
});

export const TableCellBorderBottomNullable = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== 'borderBottomNone',
})(({ borderBottomNone, theme }) => ({
  ...(borderBottomNone && {
    borderBottom: "none"
  })
}));

export const PaperGrey = styled(Paper)({
  backgroundColor: '#eee',
});

const useCommonStyles = makeStyles((theme) => ({
  buttonSpacingLeft: {
    marginLeft: theme.spacing(2)
  }
}));

export default useCommonStyles;
