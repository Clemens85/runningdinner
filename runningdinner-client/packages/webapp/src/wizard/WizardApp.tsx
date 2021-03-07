import React from 'react';
import WizardMenu from './WizardMenu';
import {Container} from "@material-ui/core";
import {Route, Switch, useRouteMatch} from "react-router-dom";
import BasicDetailsStep from "./BasicDetailsStep";
import OptionsStep from "./OptionsStep";
import {Provider, useDispatch} from "react-redux";
import {wizardStore} from "./WizardStore";
import {useQuery} from "../common/hooks/QueryHook";
import {fetchGenderAspects, fetchRegistrationTypes, updateRunningDinnerType} from "./WizardSlice";
import {MealTimesNavigationStep, OptionsNavigationStep, RunningDinnerType} from "@runningdinner/shared";
import {Helmet} from "react-helmet-async";
import {useTranslation} from "react-i18next";
import {MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import useDatePickerLocale from "../common/date/DatePickerLocaleHook";

export default function WizardAppContainer() {

  const {t} = useTranslation('wizard');
  const query = useQuery();
  const demoDinner = !!query.get("demoDinner");

  const { locale } = useDatePickerLocale();

  return (
      <Provider store={wizardStore}>
        <Helmet>
          <title>{t('wizard_create_title')}</title>
        </Helmet>
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

  React.useEffect(() => {
    dispatch(updateRunningDinnerType(demoDinner ? RunningDinnerType.DEMO : RunningDinnerType.STANDARD));
  }, [demoDinner, dispatch]);

  React.useEffect(() => {
    dispatch(fetchRegistrationTypes());
    dispatch(fetchGenderAspects());
  }, [dispatch]);

  return (
      <>
        <WizardMenu />
        <Container maxWidth="xl">
          <Switch>
            <Route path={`${path}${OptionsNavigationStep.value}`}>
              <OptionsStep/>
            </Route>
            <Route path={`${path}${MealTimesNavigationStep.value}`}>
              TODO
            </Route>
            <Route path="/">
              <BasicDetailsStep/>
            </Route>
          </Switch>
        </Container>
      </>
  );
}
