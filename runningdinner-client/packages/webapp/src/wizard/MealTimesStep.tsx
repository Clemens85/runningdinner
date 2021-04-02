import React from 'react';
import {
  getRunningDinnerBasicDetailsSelector,
  getRunningDinnerOptionsSelector,
  isClosedDinnerSelector,
  setNextNavigationStep,
  setPreviousNavigationStep, updateMeals,
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
import {useMediaQuery, useTheme} from "@material-ui/core";

export default function MealTimesStep() {

  const {t} = useTranslation(['wizard', 'common']);

  const options = useWizardSelector(getRunningDinnerOptionsSelector);
  const {date} = useWizardSelector(getRunningDinnerBasicDetailsSelector);
  const isClosedDinner = useWizardSelector(isClosedDinnerSelector);

  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down("sm"));

  const {meals} = options;

  const [mealsFormState, setMealsFormState] = React.useState(cloneDeep(meals));

  const {getIssuesTranslated} = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: 'wizard'
    }
  });
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  const dispatch = useDispatch();

  const formMethods = useForm();

  React.useEffect(() => {
    dispatch(setNextNavigationStep(isClosedDinner ? ParticipantPreviewNavigationStep : PublicRegistrationNavigationStep));
    dispatch(setPreviousNavigationStep(OptionsNavigationStep));
    // eslint-disable-next-line
  }, [dispatch]);

  const submitMealTimesAsync = async() => {
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
  };

  function handleTimeChange(meal: Meal, newTime: Date) {
    const meals = cloneDeep(mealsFormState);
    for (let i = 0; i < meals.length; i++) {
      if (meals[i].label === meal.label) {
        meals[i].time = newTime;
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

          <WizardButtons onSubmitData={submitMealTimesAsync} />
        </FormProvider>
      </div>
  );
}
