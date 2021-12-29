import React from 'react';
import {PageTitle} from "../common/theme/typography/Tags";
import {useTranslation} from "react-i18next";
import {Controller, FormProvider, useForm} from "react-hook-form";
import {
  getByValue,
  OptionsNavigationStep,
  RunningDinnerBasicDetails,
  useBackendIssueHandler,
  validateBasicDetails
} from "@runningdinner/shared";
import {useWizardSelector} from "@runningdinner/shared";
import {getRegistrationTypesSelector, getRunningDinnerBasicDetailsSelector, setNextNavigationStep, setPreviousNavigationStep, updateBasicDetails} from '@runningdinner/shared';
import Grid from "@material-ui/core/Grid";
import FormTextField from "../common/input/FormTextField";
import FormSelect from "../common/input/FormSelect";
import {Box, FormHelperText, FormLabel, MenuItem} from "@material-ui/core";
import {SpacingGrid} from "../common/theme/SpacingGrid";
import {LanguageSwitchButtons} from "../common/i18n/LanguageSwitch";
import {useNotificationHttpError} from "../common/NotificationHttpErrorHook";
import {useDispatch} from "react-redux";
import FormDatePicker from "../common/input/FormDatePicker";
import WizardButtons from "./WizardButtons";
import { FetchStatus } from 'packages/shared/src/redux';

export default function BasicDetailsStep() {

  const {t} = useTranslation(['wizard', 'common']);

  const basicDetails = useWizardSelector(getRunningDinnerBasicDetailsSelector);
  const {registrationTypes, status} = useWizardSelector(getRegistrationTypesSelector);

  const dispatch = useDispatch();

  const formMethods = useForm({
    defaultValues: basicDetails,
    mode: 'onTouched'
  });

  const { clearErrors, setError, reset, watch, control } = formMethods;

  const {applyValidationIssuesToForm} = useBackendIssueHandler();
  const {showHttpErrorDefaultNotification} = useNotificationHttpError();

  React.useEffect(() => {
    reset(basicDetails);
    clearErrors();
    // eslint-disable-next-line
  }, [reset, clearErrors, basicDetails]);

  React.useEffect(() => {
    dispatch(setNextNavigationStep(OptionsNavigationStep));
    dispatch(setPreviousNavigationStep(undefined));
    // eslint-disable-next-line
  }, [dispatch]);

  const selectedRegistrationTypeValue = watch('registrationType');

  const submitBasicDetailsAsync = async(values: RunningDinnerBasicDetails) => {
    clearErrors();
    const basicDetails = { ...values };
    try {
      await validateBasicDetails(basicDetails);
      dispatch(updateBasicDetails(basicDetails));
      return true;
    } catch(e) {
      applyValidationIssuesToForm(e, setError);
      showHttpErrorDefaultNotification(e);
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
          <SpacingGrid container>
            <SpacingGrid item xs={12} md={6}>
              <FormSelect name="registrationType"
                          variant={"outlined"}
                          label={t('common:registration_type')}
                          helperText={getByValue(selectedRegistrationTypeValue, registrationTypes)?.description}
                          defaultValue={""}
                          fullWidth>
                {
                  registrationTypes
                      .map(registrationType => <MenuItem value={registrationType.value} key={registrationType.value}>{registrationType.label}</MenuItem>)
                }
              </FormSelect>
            </SpacingGrid>
          </SpacingGrid>
          <SpacingGrid container mt={3}>
            <Grid item xs={12} md={6}>
              <FormTextField name="title"
                             label={t('common:title' )}
                             required
                             helperText={t("common:title_help")}
                             variant="outlined"
                             fullWidth />
            </Grid>
          </SpacingGrid>
          <SpacingGrid container mt={3} spacing={3}>
            <Grid item xs={12} md={3}>
              <FormTextField name="zip"
                             label={t('common:zip' )}
                             required
                             variant="outlined"
                             helperText={t("common:zip_help")}
                             fullWidth/>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormTextField name="city"
                             label={t('common:city' )}
                             required
                             variant="outlined"
                             fullWidth/>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormDatePicker name={"date"} label={t('common:date' )} inputVariant={"outlined"} />
            </Grid>
          </SpacingGrid>

          <SpacingGrid container mt={3}>
            <Grid item xs={12}>
              <FormLabel>{t('common:event_language_label')}</FormLabel>
              <Box my={1}>
                <Controller
                    name="languageCode"
                    control={control}
                    render={props =>
                        <LanguageSwitchButtons selectedLanguage={props.value}
                                               onClick={(languageCode: string) => props.onChange(languageCode)} />
                    } // props contains: onChange, onBlur and value
                />
              </Box>
              <FormHelperText>{t('common:event_language_help')}</FormHelperText>
            </Grid>
          </SpacingGrid>

          <WizardButtons onSubmitData={submitBasicDetailsAsync} />

        </form>
      </FormProvider>
    </div>
  );
}
