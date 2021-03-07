import React from 'react';
import WizardMenuNotificationBar from "./WizardMenuNotificationBar";
import {AppBar, Hidden, LinearProgress, List, ListItem, ListItemIcon, ListItemText, makeStyles, Toolbar, Typography} from "@material-ui/core";
import {useWizardSelector} from "./WizardStore";
import {getNavigationStepsSelector, isLoadingDataSelector} from "./WizardSlice";
import {useTranslation} from "react-i18next";
import {
  BasicsNavigationStep,
  FinishNavigationStep,
  MealTimesNavigationStep,
  OptionsNavigationStep,
  ParticipantPreviewNavigationStep,
  PublicRegistrationNavigationStep
} from "@runningdinner/shared";
import EditIcon from '@material-ui/icons/Edit';
import SettingsIcon from '@material-ui/icons/Settings';
import ScheduleIcon from '@material-ui/icons/Schedule';
import ListIcon from '@material-ui/icons/List';
import DoneIcon from '@material-ui/icons/Done';
import PeopleIcon from '@material-ui/icons/People';

const useStyles = makeStyles({
  navList: {
    display: `flex`,
    justifyContent: `space-evenly`,
    width: "100%"
  },
  navItem: {
    textDecoration: `none`,
    textTransform: `uppercase`,
    color: `white`,
    width: 'auto'
  },
  navIcon: {
    minWidth: "36px",
    color: 'white'
  },
  appBar: {
    color: 'white',
    backgroundColor: '#333333'
  },
  toolBar: {
    minHeight: '48px',
    maxHeight: '48px',
  }
});

// TODO: Icon min-Width of navIcon must be set to 24px for sm device size!
// TODO 2: Wizard Progress must be improved!

export default function WizardMenu() {

  const navigationSteps = useWizardSelector(getNavigationStepsSelector);
  const {t} = useTranslation('wizard');
  const classes = useStyles();

  const navigationStepIconMap: Record<string, any> = {
    [BasicsNavigationStep.value]: <EditIcon />,
    [OptionsNavigationStep.value]: <SettingsIcon />,
    [MealTimesNavigationStep.value]: <ScheduleIcon />,
    [PublicRegistrationNavigationStep.value]: <ListIcon />,
    [ParticipantPreviewNavigationStep.value]: <PeopleIcon />,
    [FinishNavigationStep.value]: <DoneIcon />
  };

  return (
      <div>
        <WizardMenuNotificationBar />
        <Toolbar className={classes.toolBar}>
          <Typography
              component="h2"
              variant="h5"
              color="inherit"
              align="center"
              noWrap>Run your Dinner Wizard</Typography>
        </Toolbar>
        <AppBar position="static" className={classes.appBar}>
          <Toolbar component={"nav"} className={classes.toolBar}>
            <List component="nav" aria-labelledby="main navigation" className={classes.navList}>
              {navigationSteps.map(({ label, value }) => (
                <ListItem key={value} className={classes.navItem}>
                  <ListItemIcon className={classes.navIcon}>
                    {navigationStepIconMap[value] || <EditIcon/>}
                  </ListItemIcon>
                  <Hidden smDown>
                    <ListItemText primary={t(label)} />
                  </Hidden>
                </ListItem>
              ))}
            </List>
          </Toolbar>
          <WizardProgressBar />
        </AppBar>
      </div>
  );
}

function WizardProgressBar() {
  const showLoadingProgress = useWizardSelector(isLoadingDataSelector);

  return (
    <>
      { showLoadingProgress ?
          <LinearProgress color="secondary" /> :
          <LinearProgress variant="determinate" value={17 * 2 + 3 } /> }
    </>
  );

}
