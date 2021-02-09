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
  }
}));

export default useCommonStyles;
