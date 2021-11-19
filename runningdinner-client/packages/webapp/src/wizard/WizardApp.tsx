import React from 'react';
import WizardMenu from './WizardMenu';
import {Container, Grid} from "@material-ui/core";
import {Route, Switch, useRouteMatch} from "react-router-dom";
import BasicDetailsStep from "./BasicDetailsStep";
import OptionsStep from "./OptionsStep";
import {Provider, useDispatch} from "react-redux";
import {useWizardSelector, wizardStore} from "@runningdinner/shared";
import {useQuery} from "../common/hooks/QueryHook";
import {fetchGenderAspects, fetchRegistrationTypes, getRunningDinnerOptionsSelector, updateMeals, updateRunningDinnerType} from "@runningdinner/shared";
import {
  FinishNavigationStep,
  MealTimesNavigationStep,
  OptionsNavigationStep,
  ParticipantPreviewNavigationStep,
  PublicRegistrationNavigationStep,
  RunningDinnerType, SummaryNavigationStep,
  useMealsTranslated
} from "@runningdinner/shared";
import {MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import useDatePickerLocale from "../common/date/DatePickerLocaleHook";
import MealTimesStep from "./MealTimesStep";
import ParticipantPreviewStep from "./ParticipantPreviewStep";
import PublicRegistrationStep from "./PublicRegistrationStep";
import FinishStep from "./FinishStep";
import SummaryStep from "./SummaryStep";
import {BrowserTitle} from "../common/mainnavigation/BrowserTitle";

export default function WizardAppContainer() {

  const query = useQuery();
  const demoDinner = !!query.get("demoDinner");

  const { locale } = useDatePickerLocale();

  return (
      <Provider store={wizardStore}>
        <BrowserTitle titleI18nKey={"wizard:wizard_create_title"} namespaces={"wizard"} />
        <MuiPickersUtilsProvider utils={DateFnsUtils} locale={locale}>
          <WizardApp demoDinner={demoDinner}/>
        </MuiPickersUtilsProvider>
      </Provider>
  );
}

interface WizardAppProps {
  demoDinner: boolean;
}

function WizardApp({demoDinner}: WizardAppProps) {

  const {path} = useRouteMatch();
  const dispatch = useDispatch();

  const {meals} = useWizardSelector(getRunningDinnerOptionsSelector);

  const {getMealsTranslated} = useMealsTranslated();

  React.useEffect(() => {
    dispatch(updateRunningDinnerType(demoDinner ? RunningDinnerType.DEMO : RunningDinnerType.STANDARD));
  }, [demoDinner, dispatch]);

  React.useEffect(() => {
    dispatch(fetchRegistrationTypes());
    dispatch(fetchGenderAspects());
  }, [dispatch]);

  React.useEffect(() => {
    if (meals) {
      const mealsTranslated = getMealsTranslated(meals);
      dispatch(updateMeals(mealsTranslated));
    }
    // eslint-disable-next-line
  }, [dispatch]);

  return (
      <>
        <WizardMenu />
        <Container maxWidth="xl">
          <Grid container>
            <Grid item xs={12} md={8}>
              <Switch>
                <Route path={`${path}${OptionsNavigationStep.value}`}>
                  <OptionsStep/>
                </Route>
                <Route path={`${path}${MealTimesNavigationStep.value}`}>
                  <MealTimesStep />
                </Route>
                <Route path={`${path}${ParticipantPreviewNavigationStep.value}`}>
                  <ParticipantPreviewStep />
                </Route>
                <Route path={`${path}${PublicRegistrationNavigationStep.value}`}>
                  <PublicRegistrationStep />
                </Route>
                <Route path={`${path}${FinishNavigationStep.value}`}>
                  <FinishStep />
                </Route>
                <Route path={`${path}${SummaryNavigationStep.value}`}>
                  <SummaryStep />
                </Route>
                <Route path="/">
                  <BasicDetailsStep />
                </Route>
              </Switch>
            </Grid>
          </Grid>
        </Container>
      </>
  );
}
