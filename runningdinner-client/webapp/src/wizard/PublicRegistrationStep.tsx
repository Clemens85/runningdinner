import React from 'react';
import { useTranslation } from 'react-i18next';
import { useWizardSelector } from '@runningdinner/shared';
import {
  getRunningDinnerBasicDetailsSelector,
  getRunningDinnerPublicSettingsSelector,
  setNextNavigationStep,
  setPreviousNavigationStep,
  updatePublicSettings,
} from '@runningdinner/shared';
import { useDispatch } from 'react-redux';
import { FormProvider, useForm } from 'react-hook-form';
import {
  MealTimesNavigationStep,
  ParticipantPreviewNavigationStep,
  RunningDinnerPublicSettings,
  useBackendIssueHandler,
  validatePublicSettings,
  HttpError,
} from '@runningdinner/shared';
import { useNotificationHttpError } from '../common/NotificationHttpErrorHook';
import { PageTitle } from '../common/theme/typography/Tags';
import WizardButtons from './WizardButtons';
import { PublicDinnerSettingsFormControl } from '../common/dinnersettings/PublicDinnerSettingsFormControl';

export default function PublicRegistrationStep() {
  const { t } = useTranslation(['wizard', 'common']);

  const publicSettings = useWizardSelector(getRunningDinnerPublicSettingsSelector);
  const { date } = useWizardSelector(getRunningDinnerBasicDetailsSelector);

  const dispatch = useDispatch();

  const formMethods = useForm({
    defaultValues: publicSettings,
    mode: 'onTouched',
  });

  const { clearErrors, setError, reset } = formMethods;

  const { applyValidationIssuesToForm } = useBackendIssueHandler();
  const { showHttpErrorDefaultNotification } = useNotificationHttpError();

  React.useEffect(() => {
    reset(publicSettings);
    clearErrors();
    // eslint-disable-next-line
  }, [reset, clearErrors, publicSettings]);

  React.useEffect(() => {
    dispatch(setNextNavigationStep(ParticipantPreviewNavigationStep));
    dispatch(setPreviousNavigationStep(MealTimesNavigationStep));
    // eslint-disable-next-line
  }, [dispatch]);

  const submitPublicSettingsAsync = async (values: RunningDinnerPublicSettings) => {
    clearErrors();
    const publicSettingsToSubmit = { ...values };
    try {
      await validatePublicSettings(publicSettingsToSubmit, date);
      dispatch(updatePublicSettings(publicSettingsToSubmit));
      return true;
    } catch (e) {
      applyValidationIssuesToForm(e as HttpError, setError);
      showHttpErrorDefaultNotification(e as HttpError);
      return false;
    }
  };

  return (
    <div>
      <PageTitle>{t('public_settings')}</PageTitle>
      <FormProvider {...formMethods}>
        <form>
          <PublicDinnerSettingsFormControl mediumDeviceHalfSize={true} />
          <WizardButtons onSubmitData={submitPublicSettingsAsync} />
        </form>
      </FormProvider>
    </div>
  );
}
