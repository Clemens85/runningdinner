import React from 'react';
import {
  AfterPartyLocation,
  enableAfterPartyLocation,
  getRunningDinnerAfterPartyLocationSelector,
  getRunningDinnerBasicDetailsSelector,
  getRunningDinnerOptionsSelector, HttpError,
  isClosedDinnerSelector,
  isValidDate,
  newAfterPartyLocation,
  setHoursAndMinutesFromSrcToDest,
  setNextNavigationStep,
  setPreviousNavigationStep,
  updateAfterPartyLocation,
  updateMeals, validateRunningDinnerAfterPartyLocation,
} from "@runningdinner/shared";
import {PageTitle} from "../common/theme/typography/Tags";
import {SpacingGrid} from "../common/theme/SpacingGrid";
import WizardButtons from "./WizardButtons";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import {
  Meal, OptionsNavigationStep, ParticipantPreviewNavigationStep, PublicRegistrationNavigationStep, useBackendIssueHandler, validateRunningDinnerOptions,
} from "@runningdinner/shared";
import {useWizardSelector} from "@runningdinner/shared";
import MealTimeEditControl from "../admin/dashboard/MealTimeEditControl";
import { cloneDeep } from 'lodash';
import {useNotificationHttpError} from "../common/NotificationHttpErrorHook";
import {FormProvider, useForm} from "react-hook-form";
import {useMediaQuery, useTheme} from "@mui/material";
import { AfterPartyLocationToggleButton } from '../common/dinnersettings/AfterPartyLocationToggleButton';
import {AfterPartyLocationFormControl} from "../common/dinnersettings/AfterPartyLocationFormControl";

export default function MealTimesStep() {

  const {t} = useTranslation(['wizard', 'common']);

  const options = useWizardSelector(getRunningDinnerOptionsSelector);
  const afterPartyLocation = useWizardSelector(getRunningDinnerAfterPartyLocationSelector);
  const {date} = useWizardSelector(getRunningDinnerBasicDetailsSelector);
  const isClosedDinner = useWizardSelector(isClosedDinnerSelector);

  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down('md'));

  const {meals} = options;

  const [mealsFormState, setMealsFormState] = React.useState(cloneDeep(meals));

  const hasAfterPartyLocationActivated = afterPartyLocation !== undefined;

  const {getIssuesTranslated, applyValidationIssuesToForm} = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: ['wizard', 'common']
    }
  });
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  const dispatch = useDispatch();

  const formMethods = useForm({
    defaultValues: newAfterPartyLocation()
  });
  const { clearErrors, setError, reset } = formMethods;

  React.useEffect(() => {
    clearErrors();
    reset(afterPartyLocation);
    // eslint-disable-next-line
  }, [reset, clearErrors, afterPartyLocation]);


  React.useEffect(() => {
    dispatch(setNextNavigationStep(isClosedDinner ? ParticipantPreviewNavigationStep : PublicRegistrationNavigationStep));
    dispatch(setPreviousNavigationStep(OptionsNavigationStep));
    // eslint-disable-next-line
  }, [dispatch]);

  const submitTimesAsync = async(afterPartyLocationValues: AfterPartyLocation) => {
    const mealtimesValidationCall = validateMealTimes();
    const afterPartyLocationValidationCall = validateAfterPartyLocation(afterPartyLocationValues);
    const mealtimesValidationResponse = await mealtimesValidationCall;
    const afterPartyLocationValidationResponse =  await afterPartyLocationValidationCall;
    return mealtimesValidationResponse && afterPartyLocationValidationResponse;
  };

  async function validateMealTimes() {
    const optionsToValidate = {...options};
    optionsToValidate.meals = mealsFormState;
    try {
      await validateRunningDinnerOptions(optionsToValidate, date);
      dispatch(updateMeals(mealsFormState));
      return true;
    } catch(e) {
      showHttpErrorDefaultNotification(e);
      return false;
    }
  }

  async function validateAfterPartyLocation(afterPartyLocationValues: AfterPartyLocation) {
    if (!hasAfterPartyLocationActivated) {
      dispatch(enableAfterPartyLocation(false));
      return true;
    }
    try {
      await validateRunningDinnerAfterPartyLocation(afterPartyLocationValues);
      dispatch(updateAfterPartyLocation(afterPartyLocationValues));
      return true;
    } catch(e) {
      applyValidationIssuesToForm(e as HttpError, setError);
      showHttpErrorDefaultNotification(e as HttpError);
      return false;
    }
  }

  function handleTimeChange(meal: Meal, newTime: Date) {
    const meals = cloneDeep(mealsFormState);
    for (let i = 0; i < meals.length; i++) {
      if (meals[i].label === meal.label) {
        meals[i].time = isValidDate(newTime) ? setHoursAndMinutesFromSrcToDest(newTime, date) : newTime;
      }
    }
    setMealsFormState(meals);
  }

  const mealTimeFields = mealsFormState.map((meal) =>
      <SpacingGrid item key={meal.label} pr={6}>
        <MealTimeEditControl {...meal} onHandleTimeChange={(newValue) => handleTimeChange(meal, newValue)} />
      </SpacingGrid>
  );
  const mealTimeFieldsDirection = isSmallDevice ? "column" : "row";

  return (
      <div>
        <PageTitle>{t('time_setup')}</PageTitle>
        <FormProvider {...formMethods}>
          <SpacingGrid container direction={mealTimeFieldsDirection}>
            {mealTimeFields}
          </SpacingGrid>

          <AfterPartyLocationToggleButton afterPartyLocationEnabled={!!afterPartyLocation}
                                          onToggleAfterPartyLocation={enable => dispatch(enableAfterPartyLocation(enable)) }
                                          mt={5} mb={3} />
          { afterPartyLocation && <AfterPartyLocationFormControl /> }

          <WizardButtons onSubmitData={submitTimesAsync} />
        </FormProvider>
      </div>
  );
}
