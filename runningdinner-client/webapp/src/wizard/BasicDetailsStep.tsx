import { HttpError, OptionsNavigationStep, RunningDinnerBasicDetails, useBackendIssueHandler, validateBasicDetails } from '@runningdinner/shared';
import { FetchStatus,useWizardSelector } from '@runningdinner/shared';
import { getRegistrationTypesSelector, getRunningDinnerBasicDetailsSelector, setNextNavigationStep, setPreviousNavigationStep, updateBasicDetails } from '@runningdinner/shared';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { BasicDinnerSettingsFormControl } from '../common/dinnersettings/BasicDinnerSettingsFormControl';
import { useNotificationHttpError } from '../common/NotificationHttpErrorHook';
import { PageTitle } from '../common/theme/typography/Tags';
import WizardButtons from './WizardButtons';

export default function BasicDetailsStep() {
  const { t } = useTranslation(['wizard', 'common']);

  const basicDetails = useWizardSelector(getRunningDinnerBasicDetailsSelector);
  const { registrationTypes, status } = useWizardSelector(getRegistrationTypesSelector);

  const dispatch = useDispatch();

  const formMethods = useForm({
    defaultValues: basicDetails,
    mode: 'onTouched',
  });

  const { clearErrors, setError, reset } = formMethods;

  const { applyValidationIssuesToForm } = useBackendIssueHandler();
  const { showHttpErrorDefaultNotification } = useNotificationHttpError();

  React.useEffect(() => {
    reset(basicDetails);
    clearErrors();
     
  }, [reset, clearErrors, basicDetails]);

  React.useEffect(() => {
    dispatch(setNextNavigationStep(OptionsNavigationStep));
    dispatch(setPreviousNavigationStep(undefined));
     
  }, [dispatch]);

  const submitBasicDetailsAsync = async (values: RunningDinnerBasicDetails) => {
    clearErrors();
    const basicDetails = { ...values };
    try {
      await validateBasicDetails(basicDetails);
      dispatch(updateBasicDetails(basicDetails));
      return true;
    } catch (e) {
      applyValidationIssuesToForm(e as HttpError, setError);
      showHttpErrorDefaultNotification(e as HttpError);
      return false;
    }
  };

  if (!registrationTypes || status !== FetchStatus.SUCCEEDED) {
    return null;
  }

  return (
    <div>
      <PageTitle>{t('basic_settings')}</PageTitle>
      <FormProvider {...formMethods}>
        <form>
          <BasicDinnerSettingsFormControl registrationTypes={registrationTypes} />
          <WizardButtons onSubmitData={submitBasicDetailsAsync} />
        </form>
      </FormProvider>
    </div>
  );
}
