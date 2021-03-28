import React from 'react';
import {useTranslation} from "react-i18next";
import {useWizardSelector} from "./WizardStore";
import {
  getRunningDinnerBasicDetailsSelector,
  getRunningDinnerPublicSettingsSelector,
  setNextNavigationStep,
  setPreviousNavigationStep,
  updatePublicSettings,
} from "./WizardSlice";
import {useDispatch} from "react-redux";
import {FormProvider, useForm} from "react-hook-form";
import {
  MealTimesNavigationStep,
  ParticipantPreviewNavigationStep,
  RunningDinnerPublicSettings,
  useBackendIssueHandler,
  validatePublicSettings,
} from "@runningdinner/shared";
import {useNotificationHttpError} from "../common/NotificationHttpErrorHook";
import {PageTitle} from "../common/theme/typography/Tags";
import {SpacingGrid} from "../common/theme/SpacingGrid";
import FormTextField from "../common/input/FormTextField";
import FormDatePicker from "../common/input/FormDatePicker";
import WizardButtons from "./WizardButtons";

export default function PublicRegistrationStep() {

  const {t} = useTranslation(['wizard', 'common']);

  const publicSettings = useWizardSelector(getRunningDinnerPublicSettingsSelector);
  const {date} = useWizardSelector(getRunningDinnerBasicDetailsSelector);

  const dispatch = useDispatch();

  const formMethods = useForm({
    defaultValues: publicSettings,
    mode: 'onTouched'
  });

  const { clearErrors, setError, reset } = formMethods;

  const {applyValidationIssuesToForm} = useBackendIssueHandler();
  const {showHttpErrorDefaultNotification} = useNotificationHttpError();

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

  const submitPublicSettingsAsync = async(values: RunningDinnerPublicSettings) => {
    clearErrors();
    const publicSettingsToSubmit = { ...values };
    try {
      await validatePublicSettings(publicSettingsToSubmit, date);
      dispatch(updatePublicSettings(publicSettingsToSubmit));
      return true;
    } catch(e) {
      applyValidationIssuesToForm(e, setError);
      showHttpErrorDefaultNotification(e);
      return false;
    }
  };

  return (
      <div>
        <PageTitle>{t('public_settings')}</PageTitle>
        <FormProvider {...formMethods}>
          <form>
            <SpacingGrid container>
              <SpacingGrid item xs={12} md={6}>
                <FormTextField name="title"
                               label={t('common:public_title' )}
                               required
                               helperText={t("common:public_title_help")}
                               variant="outlined"
                               fullWidth />
              </SpacingGrid>
            </SpacingGrid>
            <SpacingGrid container mt={3}>
              <SpacingGrid item xs={12} md={6}>
                <FormDatePicker name={"endOfRegistrationDate"}
                                label={t('common:public_end_of_registration_date' )}
                                inputVariant={"outlined"}
                                helperText={t("common:endOfRegistrationDate_help")}/>
              </SpacingGrid>
            </SpacingGrid>
            <SpacingGrid container mt={3}>
              <SpacingGrid item xs={12}>
                <FormTextField name="description"
                               label={t('common:public_description' )}
                               multiline
                               rows={8}
                               required
                               variant="outlined"
                               fullWidth />
              </SpacingGrid>
            </SpacingGrid>

            <SpacingGrid container mt={3}>
              <SpacingGrid item xs={12} md={6}>
                <FormTextField name="publicContactName"
                               label={t('common:public_contact_name' )}
                               required
                               helperText={t("common:public_contact_name_help")}
                               variant="outlined"
                               fullWidth />
              </SpacingGrid>
            </SpacingGrid>
            <SpacingGrid container mt={3}>
              <SpacingGrid item xs={12} md={6}>
                <FormTextField name="publicContactEmail"
                               label={t('common:public_contact_email' )}
                               required
                               helperText={t("common:public_contact_email_help")}
                               variant="outlined"
                               fullWidth />
              </SpacingGrid>
            </SpacingGrid>
            <SpacingGrid container mt={3}>
              <SpacingGrid item xs={12} md={6}>
                <FormTextField name="publicContactMobileNumber"
                               label={t('common:public_contact_mobile_number' )}
                               helperText={t("common:public_contact_mobile_number_help")}
                               variant="outlined"
                               fullWidth />
              </SpacingGrid>
            </SpacingGrid>

            <WizardButtons onSubmitData={submitPublicSettingsAsync} />

          </form>
        </FormProvider>
      </div>
  );
}
