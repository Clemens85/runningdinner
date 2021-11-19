import React from 'react';
import {AppBar, Drawer, Grid, Hidden, IconButton, Link, List, ListItem, ListItemText, makeStyles, Toolbar, Typography} from "@material-ui/core";
import {LanguageSwitch} from "../i18n/LanguageSwitch";
import {Link as RouterLink} from "react-router-dom";
import MenuIcon from '@material-ui/icons/Menu';
import clsx from "clsx";
import {FeedbackButtonContainerRightAligned} from "../feedback/FeedbackButton";
import {LANDING_CREATE_RUNNING_DINNER_PATH, RUNNING_DINNER_EVENTS_PATH} from "./NavigationPaths";
import {Breakpoint} from "@material-ui/core/styles/createBreakpoints";

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    marginRight: theme.spacing(4)
  },
  menuLink: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  },
  appBarColors: {
    color: 'white',
    backgroundColor: '#333333'
  },
  mobileNavList: {
    minWidth: 200,
  },
  paper: {
    background: "#333333"
  }
}));

export interface MainNavigationProps {
  baseUrl: string;
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

export const MainNavigation = ({baseUrl, mainTitle, navigationItems, topNotificationBar, mobileBreakpoint = "sm"}: MainNavigationProps) => {

  const classes = useStyles();

  const normalizedUrl = baseUrl.replace(/\/$/, ""); // Remove last trailing slash (if existing)

  const showFeedback = isShowFeedbackButton();

  const hiddenForMobileView = getMobileBreakpointsDown(mobileBreakpoint);
  const hiddenForDesktopView = getMobileBreakpointsUp(mobileBreakpoint);

  function createLink(navigationItem: NavigationItem) {
    return <Link to={`${normalizedUrl}${navigationItem.routePath}`}
                 component={RouterLink}
                 color="inherit"
                 key={navigationItem.title}
                 className={classes.menuLink}>{navigationItem.title}</Link>;
  }

  return (
    <>
      { topNotificationBar && topNotificationBar }
      <AppBar position="static" className={classes.appBarColors}>
        <Toolbar>
          <Grid container justify={"space-between"} alignItems={"center"}>
            <Grid item>
              <Grid container alignItems={"center"}>
                <Hidden only={hiddenForDesktopView}>
                  <Grid item>
                    <MobileNavigation baseUrl={normalizedUrl} navigationItems={navigationItems} />
                  </Grid>
                </Hidden>
                <Hidden only={hiddenForMobileView}>
                  <Grid item>
                    <Grid container alignItems={"center"}>
                      <Grid item>
                        <Typography variant="h6" className={classes.title}>{mainTitle}</Typography>
                      </Grid>
                      <Grid item>
                        { navigationItems.map(navigationItem => createLink(navigationItem)) }
                      </Grid>
                    </Grid>
                  </Grid>
                </Hidden>
              </Grid>
            </Grid>
            <Grid item>
              <LanguageSwitch />
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      { showFeedback && <FeedbackButtonContainerRightAligned /> }
    </>
  );
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

function MobileNavigation({baseUrl, navigationItems}: MainNavigationProps) {

  const classes = useStyles();

  const [mobileDrawerNavigationOpen, setMobileDrawerNavigationOpen] = React.useState(false);

  const toggleMobileDrawerNavigation = () => {
    setMobileDrawerNavigationOpen((prevState) => !prevState);
  };

  function createLink(navigationItem: NavigationItem) {

    const link = <Link to={`${baseUrl}${navigationItem.routePath}`}
                       component={RouterLink}
                       color="inherit"
                       onClick={toggleMobileDrawerNavigation}
                       className={classes.menuLink}>{navigationItem.title}</Link>;
    return (
      <ListItem button key={navigationItem.title} divider>
        <ListItemText primary={link} />
      </ListItem>
    );
  }

  return (
    <>
      <IconButton edge="start" color="inherit" aria-label="menu" className={classes.menuButton} onClick={toggleMobileDrawerNavigation}>
        <MenuIcon/>
      </IconButton>
      <Drawer open={mobileDrawerNavigationOpen}
              anchor="left"
              onClose={toggleMobileDrawerNavigation}
              classes={{ paper: classes.paper }}
              ModalProps={{keepMounted: true}}>
        <div className={clsx(classes.mobileNavList, classes.appBarColors)}>
          <List>
            { navigationItems.map(navigationItem => createLink(navigationItem)) }
          </List>
        </div>
      </Drawer>
    </>
  );
}
