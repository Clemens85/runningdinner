import React from 'react';
import WizardMenuNotificationBar from "./WizardMenuNotificationBar";
import {
  AppBar,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography, useMediaQuery, useTheme,
} from "@mui/material";
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
import EditIcon from '@mui/icons-material/Edit';
import SettingsIcon from '@mui/icons-material/Settings';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ListIcon from '@mui/icons-material/List';
import DoneIcon from '@mui/icons-material/Done';
import PeopleIcon from '@mui/icons-material/People';
import {useNotificationHttpError} from "../common/NotificationHttpErrorHook";
import useWizardNavigation from "./WizardNavigationHook";
import {FeedbackButtonContainerRightAligned} from "../common/feedback/FeedbackButton";
import {styled} from "@mui/material/styles";

const NavList = styled(List)(({theme}) => ({
  display: `flex`,
  justifyContent: `space-evenly`,
  width: "100%"
}));
const NavListItem = styled(ListItem)({
  textDecoration: `none`,
  textTransform: `uppercase`,
  color: `white`,
  width: 'auto'
});
const NavListItemIcon = styled(ListItemIcon)(({theme}) => ({
  [theme.breakpoints.up('md')]: {
    minWidth: "36px",
  },
  [theme.breakpoints.down('lg')]: {
    minWidth: "24px",
  },
  color: 'white'
}));

const WizardAppBar = styled(AppBar)({
  color: 'white',
  backgroundColor: '#333333'
});
const WizardToolbar = styled(Toolbar)({
  minHeight: '48px',
  maxHeight: '48px'
});

const ListItemTextBold = styled(ListItemText)({
  '& .MuiListItemText-primary': {
    fontWeight: 'bold'
  }
});

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
          <WizardToolbar>
            <Typography
              component="h2"
              variant="h5"
              color="inherit"
              align="center"
              noWrap>Run Your Dinner Wizard</Typography>
          </WizardToolbar>
          <WizardAppBar position="static">
            <WizardToolbar>
              { isStringEmpty(administrationUrl) && <NavigationLinkList /> }
            </WizardToolbar>
            <WizardProgressBar />
          </WizardAppBar>
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

  const {t} = useTranslation('wizard');

  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down('md'));

  React.useEffect(() => { // Ensure that jumping to a step is only possible if all previous steps are run through:
    if (redirectToBeginOfWizard) {
      navigateToWizardStep(BasicDetailsNavigationStep);
    }
    // eslint-disable-next-line
  }, [redirectToBeginOfWizard]);

  return (
    <NavList aria-labelledby="main navigation">
      {navigationSteps.map(({ label, value }) => (
          <NavListItem key={value}>
            <NavListItemIcon>
              {navigationStepIconMap[value]}
            </NavListItemIcon>
            {!isSmallDevice &&
              <>
                {value === currentNavigationStep.value && <ListItemTextBold primary={t(label)} />}
                {value !== currentNavigationStep.value && <ListItemText primary={t(label)}/>}
              </>
            }
          </NavListItem>
      ))}
    </NavList>
  );
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
