import React, {useContext, useEffect, useState} from 'react'
import {Route, Switch, useRouteMatch, useParams, Link as RouterLink} from "react-router-dom";
import Dashboard from "./dashboard/Dashboard";
import RunningDinnerService from "../shared/admin/RunningDinnerService";
import LoadingSpinner from "../common/theme/LoadingSpinner";
import { Toolbar, AppBar, IconButton, Typography, Container, Link, makeStyles, Hidden, Grid } from "@material-ui/core";
import MenuIcon from '@material-ui/icons/Menu';
import {AdminContext} from "./AdminContext";
import LanguageSwitch from "../common/i18n/LanguageSwitch";
import TeamsContainer from "./teams/TeamsContainer";
import ParticipantsContainer from "./participants/ParticipantsContainer";
import ParticipantMessagesContainer from "admin/messages/participants/ParticipantMessagesContainer";
import { TeamMessagesContainer } from "admin/messages/teams/TeamMessagesContainer";

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

const AdminApp = () =>  {

  const classes = useStyles();

  const {path, url} = useRouteMatch();
  const {adminId} = useParams();

  const [isLoading, setLoading] = useState(true);
  // const [runningDinner, setRunningDinner] = useState({});
  const [hasError, setError] = useState(false);

  const { setRunningDinner, runningDinner } = useContext(AdminContext);

  async function findRunningDinner() {
    RunningDinnerService
        .findRunningDinnerAsync(adminId)
        .then(data => setRunningDinner(data),
               errorResponse => setError(true))
        .then(data => setLoading(false));
  }

  useEffect(() => {
    findRunningDinner();
    // eslint-disable-next-line
  }, []);

  if (isLoading) {
    return (<LoadingSpinner></LoadingSpinner>);
  }
  if (hasError) {
    return (
        <div>Fehler beim Laden der Daten!</div>
    );
  }

  return (
      <div>
        <AppBar position="static" className={classes.appBarColors}>
          <Toolbar>
            <Grid container justify={"space-between"} alignItems={"center"}>
              <Grid item>
                <Grid container alignItems={"center"}>
                  <Grid item>
                    <IconButton edge="start" color="inherit" aria-label="menu" className={classes.menuButton}><MenuIcon/></IconButton>
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
        <Container maxWidth="xl">
          <Switch>
            <Route path={`${path}/participants/messages`}>
              <ParticipantMessagesContainer adminId={adminId}/>
            </Route>
            <Route path={`${path}/participants/:participantId`}>
              <ParticipantsContainer runningDinner={runningDinner} />
            </Route>
            <Route path={`${path}/participants`}>
              <ParticipantsContainer runningDinner={runningDinner} />
            </Route>

            <Route path={`${path}/teams/messages`}>
              <TeamMessagesContainer adminId={adminId} />
            </Route>
            <Route path={`${path}/teams/:teamId`}>
              <TeamsContainer runningDinner={runningDinner} />
            </Route>
            <Route path={`${path}/teams`}>
              <TeamsContainer runningDinner={runningDinner} />
            </Route>
            <Route path="/">
              <Dashboard runningDinner={runningDinner} onRuningDinnerUpdate={(updatedRunningDinner) => setRunningDinner(updatedRunningDinner)} />
            </Route>
          </Switch>
        </Container>
      </div>
  )
};
export default AdminApp;
