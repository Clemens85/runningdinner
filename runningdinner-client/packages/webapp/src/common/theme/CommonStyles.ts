import {styled} from "@mui/material/styles";
import {Paper, SxProps, TableCell, TableRow, Theme} from "@mui/material";

export const TableRowWithCursor = styled(TableRow)({
  cursor: "pointer"
});

export const TableCellBorderBottomNullable = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== 'borderBottomNone',
  // @ts-ignore
})(({ borderBottomNone, theme }) => ({
  ...(borderBottomNone && {
    borderBottom: "none"
  })
}));

export const PaperGrey = styled(Paper)({
  backgroundColor: '#eee',
});

export const commonStyles: Record<string, SxProps<Theme> | undefined> = {
  textAlignRight: {
    textAlign: 'right'
  },
  fullWidth: {
    width: "100%"
  },
  buttonSpacingLeft: {
    marginLeft: (theme) => theme.spacing(2)
  }
}