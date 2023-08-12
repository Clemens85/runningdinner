import makeStyles from '@mui/styles/makeStyles';
import bannerImg from "./images/banner-pan.jpg";
import {styled} from "@mui/material/styles";
import {Button, Card, Typography} from "@mui/material";

export const TeaserCardRow = styled('div')(({theme}) => ({
  marginBottom: theme.spacing(3)
}));

export const CardFlexibleHeight = styled(Card)(({theme}) => ({
  [theme.breakpoints.up('md')]: {
    height: "100%"
  }
}));

export const ExplanationBox = styled('div')(({theme}) => ({
  backgroundColor: '#e6e6e6',
  padding: theme.spacing(4)
}));

export const TypographyTransparentWhite = styled(Typography)(({theme}) => ({
  color: 'rgba(255, 255, 255, 0.87)'
}));

export const Banner = styled('div')(({theme}) => ({
  backgroundImage: `url(${bannerImg})`,
  width: '100%',
  backgroundSize: 'cover',
  color: 'white',
  marginBottom: theme.spacing(4)
}));

export const SearchPublicEventsTeaserButton = styled(Button)({
  borderWidth: "2px ! important",
  color: 'rgba(255, 255, 255, 0.87)',
  borderColor: 'rgba(255, 255, 255, 0.87)'
});


export const useLandingStyles = makeStyles((theme) => ({
  teaserCardRow: {
    [theme.breakpoints.up('md')]: {
      maxHeight: "350px"
    }
  },
  teaserSearchPublicEventsButton: {
    borderWidth: "2px ! important",
    color: 'rgba(255, 255, 255, 0.87)',
    borderColor: 'rgba(255, 255, 255, 0.87)'
  },
  bannerTypographyWhite: {
    color: 'rgba(255, 255, 255, 0.87)'
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
