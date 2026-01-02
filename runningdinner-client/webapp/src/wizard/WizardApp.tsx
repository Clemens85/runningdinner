import { Container, Grid } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { BasicDetailsNavigationStep, useWizardSelector, wizardStore } from '@runningdinner/shared';
import { fetchGenderAspects, fetchRegistrationTypes, getRunningDinnerOptionsSelector, updateMeals, updateRunningDinnerType } from '@runningdinner/shared';
import {
  FinishNavigationStep,
  MealTimesNavigationStep,
  OptionsNavigationStep,
  ParticipantPreviewNavigationStep,
  PublicRegistrationNavigationStep,
  RunningDinnerType,
  SummaryNavigationStep,
  useMealsTranslated,
} from '@runningdinner/shared';
import React from 'react';
import { Provider, useDispatch } from 'react-redux';
import { Route, Routes } from 'react-router-dom';

import useDatePickerLocale from '../common/date/DatePickerLocaleHook';
import { useUrlQuery } from '../common/hooks/useUrlQuery';
import { BrowserTitle } from '../common/mainnavigation/BrowserTitle';
import BasicDetailsStep from './BasicDetailsStep';
import FinishStep from './FinishStep';
import MealTimesStep from './MealTimesStep';
import OptionsStep from './OptionsStep';
import ParticipantPreviewStep from './ParticipantPreviewStep';
import PublicRegistrationStep from './PublicRegistrationStep';
import SummaryStep from './SummaryStep';
import WizardMenu from './WizardMenu';

export default function WizardApp() {
  const query = useUrlQuery();
  const demoDinner = !!query.get('demoDinner');

  const { locale } = useDatePickerLocale();

  return (
    <Provider store={wizardStore}>
      <BrowserTitle titleI18nKey={'wizard:wizard_create_title'} namespaces={'wizard'} />
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={locale}>
        <WizardPage demoDinner={demoDinner} />
      </LocalizationProvider>
    </Provider>
  );
}

interface WizardAppProps {
  demoDinner: boolean;
}

function WizardPage({ demoDinner }: WizardAppProps) {
  const dispatch = useDispatch();

  const { meals } = useWizardSelector(getRunningDinnerOptionsSelector);

  const { getMealsTranslated } = useMealsTranslated();

  React.useEffect(() => {
    dispatch(updateRunningDinnerType(demoDinner ? RunningDinnerType.DEMO : RunningDinnerType.STANDARD));
  }, [demoDinner, dispatch]);

  React.useEffect(() => {
    dispatch(fetchRegistrationTypes() as any);
    dispatch(fetchGenderAspects() as any);
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
      <Container id={'wizardContainer'} maxWidth={false}>
        <Grid container>
          <Grid
            size={{
              xs: 12,
              md: 8,
            }}
          >
            <Routes>
              <Route path={`${OptionsNavigationStep.value}`} element={<OptionsStep />} />
              <Route path={`${MealTimesNavigationStep.value}`} element={<MealTimesStep />} />
              <Route path={`${ParticipantPreviewNavigationStep.value}`} element={<ParticipantPreviewStep />} />
              <Route path={`${PublicRegistrationNavigationStep.value}`} element={<PublicRegistrationStep />} />
              <Route path={`${FinishNavigationStep.value}`} element={<FinishStep />} />
              <Route path={`${SummaryNavigationStep.value}`} element={<SummaryStep />} />
              <Route path={`${BasicDetailsNavigationStep.value}`} element={<BasicDetailsStep />} />
            </Routes>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
