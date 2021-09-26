import {makeStyles} from "@material-ui/core";

export const useLandingStyles = makeStyles((theme) => ({
  teaserCardRow: {
    [theme.breakpoints.up('md')]: {
      maxHeight: "350px"
    }
  },
  teaserCard: {
    [theme.breakpoints.up('md')]: {
      height: "100%"
    }
  }
}));