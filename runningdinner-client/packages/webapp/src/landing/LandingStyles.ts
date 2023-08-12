import makeStyles from '@mui/styles/makeStyles';
import bannerImg from "./images/banner-pan.jpg";
import {styled} from "@mui/material/styles";
import {Card} from "@mui/material";

export const TeaserCardRow = styled('div')(({theme}) => ({
  marginBottom: theme.spacing(3)
}));

export const CardFlexibleHeight = styled(Card)(({theme}) => ({
  [theme.breakpoints.up('md')]: {
    height: "100%"
  }
}));


export const useLandingStyles = makeStyles((theme) => ({
  teaserCardRow: {
    [theme.breakpoints.up('md')]: {
      maxHeight: "350px"
    }
  },
  banner: {
    // backgroundImage: `linear-gradient(to bottom, rgba(153, 153, 153, 0.8), rgba(250, 250, 250, 1)), url(${bannerImg})`,
    backgroundImage: `url(${bannerImg})`,
    width: '100%',
    backgroundSize: 'cover',
    color: 'white',
    marginBottom: theme.spacing(4)
  },
  teaserSearchPublicEventsButton: {
    borderWidth: "2px ! important",
    color: 'rgba(255, 255, 255, 0.87)',
    borderColor: 'rgba(255, 255, 255, 0.87)'
  },
  teaserExplanationBox: {
    backgroundColor: '#e6e6e6',
    padding: theme.spacing(4)
  },
  bannerTypographyWhite: {
    color: 'rgba(255, 255, 255, 0.87)'
  },
  teaserExplanationIconPadding: {
    marginRight: theme.spacing(2)
  }
}));

export const usePaymentStyles = makeStyles((theme) => ({
  cardList: {
    margin: 0,
    padding: 0,
    listStyle: 'none'
  },
  cardHeader: {
    backgroundColor:
      theme.palette.mode === 'light' ? theme.palette.grey[200] : theme.palette.grey[700],
  },
  cardPricing: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    marginBottom: theme.spacing(2)
  },
  headlinePricing: {
    fontSize: '2.3rem'
  }
}));

const drawerWidth = "1024px";
export const useDrawerStyles = makeStyles((theme) => ({
  drawer: {
    maxWidth: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    maxWidth: drawerWidth,
  }
}));
