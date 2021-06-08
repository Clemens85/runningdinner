import {makeStyles} from "@material-ui/core";

const useCommonStyles = makeStyles((theme) => ({
  textAlignCenter: {
    textAlign: 'center'
  },
  textAlignRight: {
    textAlign: 'right'
  },
  cursorPointer: {
    cursor: "pointer"
  },
  fullWidth: {
    width: "100%"
  },
  buttonSpacingLeft: {
    marginLeft: theme.spacing(2)
  }
}));

export default useCommonStyles;
