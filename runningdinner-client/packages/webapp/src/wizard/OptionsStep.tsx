import React from 'react';
import {PageTitle} from "../common/theme/typography/Tags";
import {FormProvider, useForm} from "react-hook-form";
import {SpacingGrid} from "../common/theme/SpacingGrid";
import {BasicDetailsNavigationStep, FetchStatus, MealTimesNavigationStep, RunningDinnerOptions, useBackendIssueHandler,} from "@runningdinner/shared";
import FormTextField from "../common/input/FormTextField";
import WizardButtons from "./WizardButtons";
import {Trans, useTranslation} from "react-i18next";
import {useWizardSelector} from "./WizardStore";
import {getGenderAspectsSelector, getRunningDinnerOptionsSelector, setNextNavigationStep, setPreviousNavigationStep} from "./WizardSlice";
import {useDispatch} from "react-redux";
import {useNotificationHttpError} from "../common/NotificationHttpErrorHook";
import FormCheckbox from "../common/input/FormCheckbox";
import FormSelect from "../common/input/FormSelect";
import { MenuItem } from '@material-ui/core';

export default function OptionsStep() {
  const {t} = useTranslation(['wizard', 'common']);

  const options = useWizardSelector(getRunningDinnerOptionsSelector);

  const dispatch = useDispatch();

  const formMethods = useForm({
    defaultValues: options,
    mode: 'onTouched'
  });

  const { clearErrors, setError, reset, watch, control } = formMethods;

  const {applyValidationIssuesToForm} = useBackendIssueHandler();
  const {showHttpErrorDefaultNotification} = useNotificationHttpError();

  React.useEffect(() => {
    reset(options);
    clearErrors();
    // eslint-disable-next-line
  }, [reset, clearErrors, options]);

  React.useEffect(() => {
    dispatch(setNextNavigationStep(MealTimesNavigationStep));
    dispatch(setPreviousNavigationStep(BasicDetailsNavigationStep));
    // eslint-disable-next-line
  }, [dispatch]);


  const submitOptionsAsync = async(values: RunningDinnerOptions) => {
    clearErrors();
    const options = { ...values };
    return false;
    // try {
    //   await validateBasicDetails(basicDetails);
    //   dispatch(updateBasicDetails(basicDetails));
    //   return true;
    // } catch(e) {
    //   applyValidationIssuesToForm(e, setError);
    //   showHttpErrorDefaultNotification(e);
    //   return false;
    // }
  };

  return (
      <div>
        <PageTitle>{t('common:details')}</PageTitle>
        <FormProvider {...formMethods}>
          <form>
            <SpacingGrid container>
              <SpacingGrid item xs={12} md={4}>
                <TeamSettings />
              </SpacingGrid>
              <SpacingGrid item xs={12} md={4}>
                <MealSettings />
              </SpacingGrid>
            </SpacingGrid>

            <WizardButtons onSubmitData={submitOptionsAsync} />

          </form>
        </FormProvider>
      </div>
  );
}

function TeamSettings() {

  const {t} = useTranslation(['wizard', 'common']);

  const {genderAspects, status} = useWizardSelector(getGenderAspectsSelector);

  if (status !== FetchStatus.SUCCEEDED) {
    return null;
  }

  return (
    <SpacingGrid container>
      <SpacingGrid item xs={12}>
        <FormTextField name="teamSize"
                       disabled={true}
                       label={t('wizard:team_size' )}
                       variant="outlined" />
      </SpacingGrid>
      <SpacingGrid item xs={12} mt={3}>
        <FormCheckbox name="forceEqualDistributedCapacityTeams" label={t("team_distribution_force_equl_hosting")} />
      </SpacingGrid>
      <SpacingGrid item xs={12} mt={3}>
        <FormSelect variant={"outlined"} name="genderAspects" label={t("gender_aspects")} fullWidth>
          { genderAspects.map(genderAspect => <MenuItem key={genderAspect.value} value={genderAspect.value}>{genderAspect.label}</MenuItem>) }
        </FormSelect>
      </SpacingGrid>
      <SpacingGrid item xs={12} mt={3}>
        <FormCheckbox name="teamPartnerWishDisabled" label={<Trans i18nKey="team_partner_wish_disabled" ns="common" />} />
      </SpacingGrid>
    </SpacingGrid>
  )
}


function MealSettings() {
  return (
    <SpacingGrid container>
      <SpacingGrid item xs={12}>
        MEALS
      </SpacingGrid>
    </SpacingGrid>
  )
}
