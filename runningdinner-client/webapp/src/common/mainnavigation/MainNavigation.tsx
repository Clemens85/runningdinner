import React from 'react';
import {
  AppBar,
  Drawer,
  Grid, Hidden,
  IconButton,
  Link,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme
} from "@mui/material";
import {LanguageSwitch} from "../i18n/LanguageSwitch";
import {Link as RouterLink, useLocation} from "react-router-dom";
import MenuIcon from '@mui/icons-material/Menu';
import {FeedbackButtonContainerRightAligned} from "../feedback/FeedbackButton";
import {LANDING_CREATE_RUNNING_DINNER_PATH, RUNNING_DINNER_EVENTS_PATH} from "./NavigationPaths";
import {Breakpoint, styled} from '@mui/material/styles';
import { DonateButton } from '../donate/DonateButton';
import { useIsBigTabletDevice } from '../theme/CustomMediaQueryHook';
import { CallbackHandler } from '@runningdinner/shared';

const HomeTitle = styled(Typography)(({theme}) => ({
  marginRight: theme.spacing(4)
}));
const HomeLink = styled(Link)({
  textDecoration: "none",
  "&:focus, &:hover, &:visited, &:link, &:active": {
    textDecoration: "none"
  }
});
const MenuLink = styled(Link)(({theme}) => ({
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(2)
}));
const ToggleMenuBurgerButton = styled(IconButton)(({theme}) => ({
  marginRight: theme.spacing(2)
}));
const AppBarBlackWhite = styled(AppBar)({
  color: 'white',
  backgroundColor: '#333333'
});
const MobileNavItemsContainer = styled('div')({
  color: 'white',
  backgroundColor: '#333333',
  minWidth: 200
});
const DrawerBlack = styled(Drawer)( {
  '& .MuiDrawer-paper': {
    background: "#333333"
  }
});

export interface MainNavigationProps {
  navigationItems: NavigationItem[];
  mainTitle?: string;
  topNotificationBar?: React.ReactNode;
  mobileBreakpoint?: Breakpoint;
}

interface NavigationItem {
  routePath: string;
  title: string;
}

const breakpoints: Array<Breakpoint> = ["xs", "sm", "md", "lg", "xl"];

export const MainNavigation = ({mainTitle, navigationItems, topNotificationBar, mobileBreakpoint = "sm"}: MainNavigationProps) => {

  const [showFeedback, setShowFeedback] = React.useState(isShowFeedbackButton());
  const [mobileDrawerNavigationOpen, setMobileDrawerNavigationOpen] = React.useState(false);

  const location = useLocation();
  
  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('md'));
  const isBigTabletDevice = useIsBigTabletDevice();

  React.useEffect(() => {
    setShowFeedback(isShowFeedbackButton());
  }, [location]);

  const hiddenForMobileView = getMobileBreakpointsDown(mobileBreakpoint);
  const hiddenForDesktopView = getMobileBreakpointsUp(mobileBreakpoint);

  const donatePaddingRight = isMobileDevice || isBigTabletDevice ? 3 : 12;

  const handleToggleMobileDrawerNavigation = () => {
    setMobileDrawerNavigationOpen((prevState) => !prevState);
  };

  function createLink(navigationItem: NavigationItem) {
    return (
      <MenuLink
        to={`${navigationItem.routePath}`}
        component={RouterLink}
        color="inherit"
        key={navigationItem.title}
        underline="hover">{navigationItem.title}</MenuLink>
    );
  }

  return <>
    { !!topNotificationBar && topNotificationBar }
    <AppBarBlackWhite position="static">
      <Toolbar>
        <Grid container justifyContent={"space-between"} alignItems={"center"}>
          <Grid item>
            <Grid container alignItems={"center"}>
              <Hidden only={hiddenForDesktopView}>
                <Grid item>
                  <MobileNavigation navigationItems={navigationItems} mobileDrawerNavigationOpen={mobileDrawerNavigationOpen} 
                                                                      onToggleMobileDrawerNavigation={handleToggleMobileDrawerNavigation} />
                </Grid>
              </Hidden>
              <Hidden only={hiddenForMobileView}>
                <Grid item>
                  <Grid container alignItems={"center"}>
                    <Grid item>
                      <HomeLink
                        to={`${navigationItems[0].routePath}`}
                        component={RouterLink}
                        color="inherit"
                        underline="hover">
                        <HomeTitle variant="h6">{mainTitle}</HomeTitle>
                      </HomeLink>
                    </Grid>
                    <Grid item>
                      {navigationItems.map(navigationItem => createLink(navigationItem))}
                    </Grid>
                  </Grid>
                </Grid>
              </Hidden>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container id="donate-btn-container">
                <Grid item sx={{ pr: donatePaddingRight }}>
                  <DonateButton />
                </Grid>
              <Grid item>
                <LanguageSwitch />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBarBlackWhite>
    { showFeedback && <FeedbackButtonContainerRightAligned /> }
  </>;
};

function isShowFeedbackButton() {
  let pathName = window.location.pathname || "";
  pathName = pathName.toLowerCase();

  return pathName.indexOf("/admin/") >= 0 ||
         pathName.indexOf(LANDING_CREATE_RUNNING_DINNER_PATH) >= 0 ||
         pathName.indexOf(RUNNING_DINNER_EVENTS_PATH) >= 0;
}

function getMobileBreakpointsDown(breakpoint: Breakpoint): Breakpoint[] {
  return breakpoints.slice(0, breakpoints.indexOf(breakpoint) + 1);
}
function getMobileBreakpointsUp(breakpoint: Breakpoint): Breakpoint[] {
  const indexOfIncomingBreakpoint = breakpoints.indexOf(breakpoint);
  if (indexOfIncomingBreakpoint + 1 >= breakpoints.length) {
    return [breakpoints[breakpoints.length - 1]];
  }
  return breakpoints.slice(indexOfIncomingBreakpoint + 1);
}

interface MobileNavigationProps extends MainNavigationProps {
  mobileDrawerNavigationOpen: boolean;
  onToggleMobileDrawerNavigation: CallbackHandler;
}
function MobileNavigation({navigationItems, mobileDrawerNavigationOpen, onToggleMobileDrawerNavigation}: MobileNavigationProps) {

  function createLink(navigationItem: NavigationItem) {

    const link = <MenuLink
      to={`${navigationItem.routePath}`}
      component={RouterLink}
      color="inherit"
      onClick={onToggleMobileDrawerNavigation}
      underline="hover">{navigationItem.title}</MenuLink>;
    return (
      <ListItemButton key={navigationItem.title} divider>
        <ListItemText primary={link} />
      </ListItemButton>
    );
  }

  return <>
    <ToggleMenuBurgerButton
      edge="start"
      color="inherit"
      aria-label="menu"
      onClick={onToggleMobileDrawerNavigation}
      size="large">
      <MenuIcon/>
    </ToggleMenuBurgerButton>
    <DrawerBlack open={mobileDrawerNavigationOpen}
            anchor="left"
            onClose={onToggleMobileDrawerNavigation}
            ModalProps={{keepMounted: true}}>
      <MobileNavItemsContainer>
        <List>
          { navigationItems.map(navigationItem => createLink(navigationItem)) }
        </List>
      </MobileNavItemsContainer>
    </DrawerBlack>
  </>;
}
