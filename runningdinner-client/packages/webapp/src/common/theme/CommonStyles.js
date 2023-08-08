import makeStyles from '@mui/styles/makeStyles';

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
  fullHeight: {
    height: "100%"
  },
  buttonSpacingLeft: {
    marginLeft: theme.spacing(2)
  },
  textTransformUppercase: {
    textTransform: 'uppercase',
  },
  colorSecondary: {
    color: theme.palette.secondary.main
  },
  bottomBorderNone: {
    borderBottom: "none"
  },
  paddingTopNone: {
    paddingTop: 0
  }
}));

export default useCommonStyles;
