import makeStyles from '@mui/styles/makeStyles';

const useTeamStyles = makeStyles((theme) => ({
  cancelledText: {
      color: theme.palette.secondary.main,
      letterSpacing: "4px",
      textTransform: "uppercase"
  }
}));

export default useTeamStyles;
