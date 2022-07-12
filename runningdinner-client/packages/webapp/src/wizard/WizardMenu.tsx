import React from 'react';
import WizardMenuNotificationBar from "./WizardMenuNotificationBar";
import {AppBar, Hidden, LinearProgress, List, ListItem, ListItemIcon, ListItemText, makeStyles, Toolbar, Typography} from "@material-ui/core";
import {useWizardSelector} from "@runningdinner/shared/";
import {
  getAdministrationUrlSelector,
  getLoadingDataErrorSelector,
  getAllNavigationStepsSelector,
  isLoadingDataSelector,
  getCurrentNavigationStepSelector,
} from "@runningdinner/shared";
import {useTranslation} from "react-i18next";
import {
  BasicDetailsNavigationStep,
  FinishNavigationStep, isStringEmpty, isStringNotEmpty,
  MealTimesNavigationStep,
  OptionsNavigationStep,
  ParticipantPreviewNavigationStep,
  PublicRegistrationNavigationStep, SummaryNavigationStep, useBackendIssueHandler
} from "@runningdinner/shared";
import EditIcon from '@material-ui/icons/Edit';
import SettingsIcon from '@material-ui/icons/Settings';
import ScheduleIcon from '@material-ui/icons/Schedule';
import ListIcon from '@material-ui/icons/List';
import DoneIcon from '@material-ui/icons/Done';
import PeopleIcon from '@material-ui/icons/People';
import {useNotificationHttpError} from "../common/NotificationHttpErrorHook";
import useWizardNavigation from "./WizardNavigationHook";
import {FeedbackButtonContainerRightAligned} from "../common/feedback/FeedbackButton";

const useMenuStyles = makeStyles((theme) => ({
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
    [theme.breakpoints.up('md')]: {
      minWidth: "36px",
    },
    [theme.breakpoints.down('md')]: {
      minWidth: "24px",
    },
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
}));

const useListItemTextStyles = makeStyles(() => ({
  primary: {
    fontWeight: 'bold'
  }
}));

const navigationStepIconMap: Record<string, any> = {
  [BasicDetailsNavigationStep.value]: <EditIcon />,
  [OptionsNavigationStep.value]: <SettingsIcon />,
  [MealTimesNavigationStep.value]: <ScheduleIcon />,
  [PublicRegistrationNavigationStep.value]: <ListIcon />,
  [ParticipantPreviewNavigationStep.value]: <PeopleIcon />,
  [FinishNavigationStep.value]: <DoneIcon />
};

export default function WizardMenu() {

  const administrationUrl = useWizardSelector(getAdministrationUrlSelector);
  const { currentNavigationStep } = useWizardSelector(getCurrentNavigationStepSelector);
  const {navigateToWizardStep} = useWizardNavigation();
  const classes = useMenuStyles();

  React.useEffect(() => { // Disable back button after dinner is created in wizard
    console.log(`currentStep is ${currentNavigationStep.value}`);
    if (currentNavigationStep.value !== SummaryNavigationStep.value && isStringNotEmpty(administrationUrl)) {
      navigateToWizardStep(SummaryNavigationStep);
    }
    // eslint-disable-next-line
  }, [administrationUrl, currentNavigationStep.value]);

  return (
      <div>
        <div>
          <WizardMenuNotificationBar />
          <Toolbar className={classes.toolBar}>
            <Typography
              component="h2"
              variant="h5"
              color="inherit"
              align="center"
              noWrap>Run Your Dinner Wizard</Typography>
          </Toolbar>
          <AppBar position="static" className={classes.appBar}>
            <Toolbar component={"nav"} className={classes.toolBar}>
              { isStringEmpty(administrationUrl) && <NavigationLinkList /> }
            </Toolbar>
            <WizardProgressBar />
          </AppBar>
        </div>
        <div>
          <FeedbackButtonContainerRightAligned />
        </div>
      </div>

  );
}

function NavigationLinkList() {

  const navigationSteps = useWizardSelector(getAllNavigationStepsSelector);
  const { redirectToBeginOfWizard, currentNavigationStep } = useWizardSelector(getCurrentNavigationStepSelector);
  const {navigateToWizardStep} = useWizardNavigation();
  const menuClasses = useMenuStyles();
  const listItemTextClasses = useListItemTextStyles();

  const {t} = useTranslation('wizard');

  React.useEffect(() => { // Ensure that jumping to a step is only possible if all previous steps are run through:
    if (redirectToBeginOfWizard) {
      navigateToWizardStep(BasicDetailsNavigationStep);
    }
    // eslint-disable-next-line
  }, [redirectToBeginOfWizard]);

  return (
    <List component="nav" aria-labelledby="main navigation" className={menuClasses.navList}>
      {navigationSteps.map(({ label, value }) => (
          <ListItem key={value} className={menuClasses.navItem}>
            <ListItemIcon className={menuClasses.navIcon}>
              {navigationStepIconMap[value]}
            </ListItemIcon>
            <Hidden smDown>
              { value === currentNavigationStep.value && <ListItemText primary={t(label)} classes={{ primary: listItemTextClasses.primary}} /> }
              { value !== currentNavigationStep.value && <ListItemText primary={t(label)} /> }
            </Hidden>
          </ListItem>
      ))}
    </List>
  )
}

function WizardProgressBar() {

  const showLoadingProgress = useWizardSelector(isLoadingDataSelector);
  const loadingError = useWizardSelector(getLoadingDataErrorSelector);

  const {percentage} = useWizardSelector(getCurrentNavigationStepSelector);
  const {getIssuesTranslated} = useBackendIssueHandler();
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  React.useEffect(() => {
    if (loadingError) {
      showHttpErrorDefaultNotification(loadingError);
    }
    // eslint-disable-next-line
  }, [loadingError]);

  return (
    <>
      { showLoadingProgress ?
          <LinearProgress color="secondary" /> :
          <LinearProgress variant="determinate" value={percentage} /> }
    </>
  );

}
