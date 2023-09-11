import React from 'react';
import Grid from "@mui/material/Grid";
import {PrimaryButton} from "../common/theme/PrimaryButton";
import {useFormContext} from "react-hook-form";
import {useTranslation} from "react-i18next";
import {useWizardSelector} from "@runningdinner/shared";
import SecondaryButton from "../common/theme/SecondaryButton";
import {getNavigationStepSelector} from "@runningdinner/shared";
import useWizardNavigation from "./WizardNavigationHook";
import {SummaryNavigationStep} from "@runningdinner/shared";
import {commonStyles} from "../common/theme/CommonStylesSx";

export interface WizardButtonsProps {
  onSubmitData:  (data: any) => Promise<boolean>;
}

export default function WizardButtons({onSubmitData}: WizardButtonsProps) {

  const {t} = useTranslation(['common', 'wizard']);
  const {handleSubmit, formState} = useFormContext();

  const {nextNavigationStep, previousNavigationStep} = useWizardSelector(getNavigationStepSelector);

  const {navigateToWizardStep} = useWizardNavigation();

  const handleNext = async(values: unknown) => {
    const canProceed = await onSubmitData(values);
    if (canProceed) {
      navigateToWizardStep(nextNavigationStep);
    }
  };

  const handlePrevious = async() => {
    const canProceed = true;
    if (canProceed) {
      navigateToWizardStep(previousNavigationStep);
    }
  };

  const lastStepBeforeSummary = nextNavigationStep && nextNavigationStep.value === SummaryNavigationStep.value;

  return (
      <Grid container justifyContent="flex-end" sx={{...commonStyles.textAlignRight, my: 3}}>
        <Grid item xs={12}>
          { previousNavigationStep && <SecondaryButton onClick={handleSubmit(handlePrevious)} data-testid={"wizard-previous-action"}>{t('common:back')}</SecondaryButton> }
          { nextNavigationStep && <PrimaryButton disabled={formState.isSubmitting} size={"large"} onClick={handleSubmit(handleNext)} ml={1} data-testid={"wizard-next-action"}>
                                      { lastStepBeforeSummary ? t('wizard:finish') : t('common:next') }
                                  </PrimaryButton> }
        </Grid>
      </Grid>
  );
}
