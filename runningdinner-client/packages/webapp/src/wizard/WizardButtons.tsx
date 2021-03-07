import React from 'react';
import {SpacingGrid} from "../common/theme/SpacingGrid";
import Grid from "@material-ui/core/Grid";
import {PrimaryButton} from "../common/theme/PrimaryButton";
import {useFormContext} from "react-hook-form";
import {useTranslation} from "react-i18next";
import {useWizardSelector} from "./WizardStore";
import SecondaryButton from "../common/theme/SecondaryButton";
import {getNavigationStepSelector} from "./WizardSlice";
import useWizardNavigation from "./WizardNavigationHook";

export interface WizardButtonsProps {
  onSubmitData:  (data: any) => Promise<boolean>;
}

export default function WizardButtons({onSubmitData}: WizardButtonsProps) {

  const {t} = useTranslation('common');
  const {handleSubmit, formState} = useFormContext();

  const {nextNavigationStep, previousNavigationStep} = useWizardSelector(getNavigationStepSelector);

  const {navigateToWizardStep} = useWizardNavigation();

  const handleNext = async(values: unknown) => {
    const canProceed = await onSubmitData(values);
    if (canProceed) {
      navigateToWizardStep(nextNavigationStep);
    }
  };

  const handlePrevious = async(values: unknown) => {
    const canProceed = await onSubmitData(values);
    if (canProceed) {
      navigateToWizardStep(previousNavigationStep);
    }
  };

  return (
      <SpacingGrid container justify={"flex-end"} mt={3}>
        <Grid item xs={12} md={4}>
          { previousNavigationStep && <SecondaryButton onClick={handleSubmit(handlePrevious)}>{t('back')}</SecondaryButton> }
          { nextNavigationStep && <PrimaryButton disabled={formState.isSubmitting} size={"large"} onClick={handleSubmit(handleNext)}>
                                    {t('next')}
                                  </PrimaryButton> }
        </Grid>
      </SpacingGrid>
  );
}
