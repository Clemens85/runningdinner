import React from 'react';
import WizardMenu from './WizardMenu';
import {Container, Grid} from "@mui/material";
import {Route, Routes} from "react-router-dom";
import BasicDetailsStep from "./BasicDetailsStep";
import OptionsStep from "./OptionsStep";
import {Provider, useDispatch} from "react-redux";
import {BasicDetailsNavigationStep, useWizardSelector, wizardStore} from "@runningdinner/shared";
import {useUrlQuery} from "../common/hooks/useUrlQuery";
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
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import useDatePickerLocale from "../common/date/DatePickerLocaleHook";
import MealTimesStep from "./MealTimesStep";
import ParticipantPreviewStep from "./ParticipantPreviewStep";
import PublicRegistrationStep from "./PublicRegistrationStep";
import FinishStep from "./FinishStep";
import SummaryStep from "./SummaryStep";
import {BrowserTitle} from "../common/mainnavigation/BrowserTitle";

export default function WizardApp() {

  const query = useUrlQuery();
  const demoDinner = !!query.get("demoDinner");

  const { locale } = useDatePickerLocale();

  return (
      <Provider store={wizardStore}>
        <BrowserTitle titleI18nKey={"wizard:wizard_create_title"} namespaces={"wizard"} />
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale}>
          <WizardPage demoDinner={demoDinner}/>
        </LocalizationProvider>
      </Provider>
  );
}

interface WizardAppProps {
  demoDinner: boolean;
}

function WizardPage({demoDinner}: WizardAppProps) {

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
        <Container id={"wizardContainer"} maxWidth={false}>
          <Grid container>
            <Grid item xs={12} md={8}>
              <Routes>
                <Route path={`${OptionsNavigationStep.value}`} element={<OptionsStep/>} />
                <Route path={`${MealTimesNavigationStep.value}`} element={<MealTimesStep />} />
                <Route path={`${ParticipantPreviewNavigationStep.value}`} element={<ParticipantPreviewStep />} />
                <Route path={`${PublicRegistrationNavigationStep.value}`} element={<PublicRegistrationStep />} />
                <Route path={`${FinishNavigationStep.value}`} element={<FinishStep />} />
                <Route path={`${SummaryNavigationStep.value}`} element={<SummaryStep />} />
                <Route path={`${BasicDetailsNavigationStep.value}`}  element={<BasicDetailsStep />} />
              </Routes>
            </Grid>
          </Grid>
        </Container>
      </>
  );
}
