import React from 'react';
import {getRunningDinnerOptionsSelector, isClosedDinnerSelector, setNextNavigationStep, setPreviousNavigationStep} from "./WizardSlice";
import {PageTitle} from "../common/theme/typography/Tags";
import {FormProvider, useForm} from "react-hook-form";
import {SpacingGrid} from "../common/theme/SpacingGrid";
import WizardButtons from "./WizardButtons";
import {useTranslation} from "react-i18next";
import {useDispatch} from "react-redux";
import {
  BasicDetailsNavigationStep,
  formatLocalDateWithSeconds,
  MealTimesNavigationStep,
  OptionsNavigationStep, ParticipantPreviewNavigationStep, PublicRegistrationNavigationStep,
  RunningDinnerOptions,
  validateRunningDinnerOptions
} from "@runningdinner/shared";
import {useWizardSelector} from "./WizardStore";

export default function MealTimesStep() {

  const {t} = useTranslation(['wizard', 'common']);

  const {meals} = useWizardSelector(getRunningDinnerOptionsSelector);
  const isClosedDinner = useWizardSelector(isClosedDinnerSelector);

  const dispatch = useDispatch();

  const formMethods = useForm({
    defaultValues: {},
    mode: 'onTouched'
  });

  React.useEffect(() => {
    dispatch(setNextNavigationStep(isClosedDinner ? ParticipantPreviewNavigationStep : PublicRegistrationNavigationStep));
    dispatch(setPreviousNavigationStep(OptionsNavigationStep));
    // eslint-disable-next-line
  }, [dispatch]);

  const { clearErrors, setError, reset } = formMethods;

  const submitMealTimesAsync = async(values: any) => {
    clearErrors();
    const mealTimesToSubmit = { ...values };
    alert(`${mealTimesToSubmit}`);
    return false;
  };

  return (

      <div>
        <PageTitle>{t('time_setup')}</PageTitle>
        <FormProvider {...formMethods}>
          <form>
            <SpacingGrid container>
              <>
                {meals.map(meal => <div key={meal.label}>{meal.label} - {formatLocalDateWithSeconds(meal.time)}</div>)}
              </>
            </SpacingGrid>

            <WizardButtons onSubmitData={submitMealTimesAsync} />

          </form>
        </FormProvider>
      </div>
  );
}
