import React from 'react';
import {AppBar, Grid, Hidden, IconButton, Link, makeStyles, Toolbar, Typography} from "@material-ui/core";
import {LanguageSwitch} from "../common/i18n/LanguageSwitch";
import {Link as RouterLink} from "react-router-dom";
import MenuIcon from '@material-ui/icons/Menu';
import AdminNotificationBar from "./common/AdminNotificationBar";

const useStyles = makeStyles((theme) => ({
  menuButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    // flexGrow: 1,
    marginRight: theme.spacing(4)
  },
  menuLink: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  },
  appBarColors: {
    color: 'white',
    backgroundColor: '#333333'
  }
}));

export interface AdminMenuProps {
  url: string;
}

export const AdminMenu = ({url}: AdminMenuProps) => {

  const classes = useStyles();

  return (
      <>
        <AdminNotificationBar />
        <AppBar position="static" className={classes.appBarColors}>
          <Toolbar>
            <Grid container justify={"space-between"} alignItems={"center"}>
              <Grid item>
                <Grid container alignItems={"center"}>
                  <Grid item>
                    <IconButton edge="start" color="inherit" aria-label="menu" className={classes.menuButton}>
                      <MenuIcon/>
                    </IconButton>
                  </Grid>
                  <Grid item>
                    <Hidden xsDown>
                      <Grid container alignItems={"center"}>
                        <Grid item>
                          <Typography variant="h6" className={classes.title}>Run Your Dinner Administration</Typography>
                        </Grid>
                        <Grid item>
                          <Link to={`${url}`} component={RouterLink} color="inherit" className={classes.menuLink}>Dashboard</Link>
                          <Link to={`${url}/participants`} component={RouterLink} color="inherit" className={classes.menuLink}>Teilnehmer</Link>
                          <Link to={`${url}/teams`} component={RouterLink} color="inherit" className={classes.menuLink}>Teams</Link>
                        </Grid>
                      </Grid>
                    </Hidden>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <LanguageSwitch />
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
      </>
  );
};
