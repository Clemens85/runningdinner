import {makeStyles} from "@material-ui/core/styles";

const useTeamStyles = makeStyles((theme) => ({
  cancelledText: {
      color: theme.palette.secondary.main,
      letterSpacing: "4px",
      textTransform: "uppercase"
  }
}));

export default useTeamStyles;
