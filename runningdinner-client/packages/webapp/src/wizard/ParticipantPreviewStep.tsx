import React from 'react';
import {Trans, useTranslation} from "react-i18next";
import {useWizardSelector} from "./WizardStore";
import {
  getMinimumParticipantsNeededSelector,
  isClosedDinnerSelector,
  isDemoDinnerSelector,
  setNextNavigationStep,
  setPreviousNavigationStep,
} from "./WizardSlice";
import {
  FinishNavigationStep,
  MealTimesNavigationStep,
  PublicRegistrationNavigationStep,
} from "@runningdinner/shared";
import {useDispatch} from "react-redux";
import {FormProvider, useForm} from "react-hook-form";
import {PageTitle} from "../common/theme/typography/Tags";
import Paragraph from "../common/theme/typography/Paragraph";
import WizardButtons from "./WizardButtons";

export default function ParticipantPreviewStep() {

  const {t} = useTranslation(['wizard', 'common']);

  const isDemoDinner = useWizardSelector(isDemoDinnerSelector);
  const isClosedDinner = useWizardSelector(isClosedDinnerSelector);
  const numParticipantsNeeded = useWizardSelector(getMinimumParticipantsNeededSelector);

  const dispatch = useDispatch();
  const formMethods = useForm();

  React.useEffect(() => {
    dispatch(setPreviousNavigationStep(isClosedDinner ? MealTimesNavigationStep : PublicRegistrationNavigationStep));
    dispatch(setNextNavigationStep(FinishNavigationStep));
    // eslint-disable-next-line
  }, [dispatch]);

  const submitAsync = async() => {
    return true;
  };

  return (
      <div>
        <PageTitle>{t('participants_preview')}</PageTitle>
        <FormProvider {...formMethods}>
          { !isDemoDinner && <Paragraph><Trans i18nKey="wizard:participants_preview_text" values={{ numParticipants: numParticipantsNeeded }}/></Paragraph> }
          { isDemoDinner && <Paragraph><Trans i18nKey="wizard:participants_preview_demo_text" /></Paragraph> }
          <WizardButtons onSubmitData={submitAsync} />
        </FormProvider>
      </div>
  );
}
