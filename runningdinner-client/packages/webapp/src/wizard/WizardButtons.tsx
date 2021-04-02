import React from 'react';
import {SpacingGrid} from "../common/theme/SpacingGrid";
import Grid from "@material-ui/core/Grid";
import {PrimaryButton} from "../common/theme/PrimaryButton";
import {useFormContext} from "react-hook-form";
import {useTranslation} from "react-i18next";
import {useWizardSelector} from "@runningdinner/shared";
import SecondaryButton from "../common/theme/SecondaryButton";
import {getNavigationStepSelector} from "@runningdinner/shared";
import useWizardNavigation from "./WizardNavigationHook";
import useCommonStyles from '../common/theme/CommonStyles';
import {SummaryNavigationStep} from "@runningdinner/shared";

export interface WizardButtonsProps {
  onSubmitData:  (data: any) => Promise<boolean>;
}

export default function WizardButtons({onSubmitData}: WizardButtonsProps) {

  const classes = useCommonStyles();
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
      <SpacingGrid container justify="flex-end" my={3} className={classes.textAlignRight}>
        <Grid item xs={12}>
          { previousNavigationStep && <SecondaryButton onClick={handleSubmit(handlePrevious)}>{t('common:back')}</SecondaryButton> }
          { nextNavigationStep && <PrimaryButton disabled={formState.isSubmitting} size={"large"} onClick={handleSubmit(handleNext)} ml={1}>
                                      { lastStepBeforeSummary ? t('wizard:finish') : t('common:next') }
                                  </PrimaryButton> }
        </Grid>
      </SpacingGrid>
  );
}
