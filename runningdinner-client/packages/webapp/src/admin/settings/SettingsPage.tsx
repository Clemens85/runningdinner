import React, {useState} from 'react';
import {FormProvider, useForm} from "react-hook-form";
import {
  BaseRunningDinnerProps, findRegistrationTypesAsync, HttpError, isClosedDinner, LabelValue, RunningDinner,
  RunningDinnerBasicDetailsFormModel,
  newEmptyRunningDinnerBasicDetailsFormModel,
  updateBasicSettingsAsync,
  useBackendIssueHandler,
  getBackendIssuesFromErrorResponse,
  newHttpError,
  useDisclosure,
  getSettingsChangeTypeListAsync,
  isArrayNotEmpty,
  SettingsChangeType,
  newEmptyRunningDinnerPublicSettings,
  updatePublicSettingsAsync,
  RunningDinnerPublicSettings,
  MessageSubType
} from "@runningdinner/shared";
import {useNotificationHttpError} from "../../common/NotificationHttpErrorHook";
import { SpacingGrid } from '../../common/theme/SpacingGrid';
import {BasicDinnerSettingsFormControl} from "../../common/dinnersettings/BasicDinnerSettingsFormControl";
import {Fetch} from "../../common/Fetch";
import {PageTitle} from "../../common/theme/typography/Tags";
import {Trans, useTranslation} from "react-i18next";
import DateFnsUtils from "@date-io/date-fns";
import useDatePickerLocale from "../../common/date/DatePickerLocaleHook";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import {PrimaryButton} from "../../common/theme/PrimaryButton";
import { useCustomSnackbar } from '../../common/theme/CustomSnackbarHook';
import { BasicSettingsChangeDialog, BasicSettingsChangeDialogData } from './BasicSettingsChangeDialog';
import { useAdminNavigation } from '../AdminNavigationHook';
import {Link} from "@material-ui/core";

export function SettingsPage({runningDinner}: BaseRunningDinnerProps) {

  const { locale } = useDatePickerLocale();

  return (
    <>
      <MuiPickersUtilsProvider utils={DateFnsUtils} locale={locale}>
        <Fetch asyncFunction={findRegistrationTypesAsync}
               parameters={[]}
               render={resultWrapper => <SettingsViewController registrationTypes={resultWrapper.result} runningDinner={runningDinner} /> }
        />
      </MuiPickersUtilsProvider>
    </>
  );

}

export interface SettingsViewControllerProps extends BaseRunningDinnerProps {
  registrationTypes: LabelValue[];
}

function SettingsViewController({runningDinner, registrationTypes}: SettingsViewControllerProps) {

  const {t} = useTranslation(['common']);

  const [currentRunningDinner, setCurrentRunningDinner] = useState(runningDinner);

  function handleBasicSettingsSaved(updatedRunningDinner: RunningDinner) {
    setCurrentRunningDinner(updatedRunningDinner);
  }

  return (
    <>
      <PageTitle>{t('common:settings')}</PageTitle>
      <SpacingGrid container>
        <SpacingGrid item xs={12} md={6}>
          <BasicDinnerSettingsView registrationTypes={registrationTypes} runningDinner={currentRunningDinner} onSettingsSaved={handleBasicSettingsSaved} />
        </SpacingGrid>
        { !isClosedDinner(runningDinner) &&
          <SpacingGrid item xs={12} md={6}>
            <PublicDinnerSettingsView runningDinner={currentRunningDinner} onSettingsSaved={handleBasicSettingsSaved} registrationTypes={registrationTypes}/>
          </SpacingGrid>
        }
      </SpacingGrid>
    </>
  );

}


interface BasicDinnerSettingsViewProps extends SettingsViewControllerProps {
  onSettingsSaved: (runningDinner: RunningDinner) => unknown;
}

function BasicDinnerSettingsView({runningDinner, registrationTypes, onSettingsSaved}: BasicDinnerSettingsViewProps) {

  const {t} = useTranslation(['common', 'admin']);

  const {basicDetails, adminId} = runningDinner;
  
  const {showSuccess} = useCustomSnackbar();

  const {generateParticipantMessagesPath} = useAdminNavigation();

  const {open: openBasicSettingsChangeDialog, 
        isOpen: isBasicSettngsChangeDialogOpen, 
        getIsOpenData: getBasicSettingsChangeDialogData,
        close: closeBasicSettingsChangeDialog} = useDisclosure<BasicSettingsChangeDialogData>();

  const formMethods = useForm({
    defaultValues: newEmptyRunningDinnerBasicDetailsFormModel(),
    mode: 'onTouched'
  });
  const { clearErrors, setError, handleSubmit, reset, formState } = formMethods;

  React.useEffect(() => {
    reset({
      ...basicDetails,
      teamPartnerWishDisabled: runningDinner.options.teamPartnerWishDisabled
    });
    clearErrors();
  }, [basicDetails, runningDinner.options.teamPartnerWishDisabled, reset, clearErrors]);

  const {applyValidationIssuesToForm} = useBackendIssueHandler();
  const {showHttpErrorDefaultNotification} = useNotificationHttpError();

  async function handleSubmitBasicDetailsAsync(values: RunningDinnerBasicDetailsFormModel) {
    clearErrors();
    const basicDetailsToSubmit = { ...values };

    const settingsChangeTypeList = await getSettingsChangeTypeListAsync(basicDetails, basicDetailsToSubmit, adminId);
    if (isArrayNotEmpty(settingsChangeTypeList)) {
      openBasicSettingsChangeDialog({
        settingsChangeTypeList,
        basicDetailsToSubmit
      });
    } else {
      await saveBasicDetailsAsync(basicDetailsToSubmit, t("admin:settings_saved_success"));
    }
  }

  async function handleBasicSettingsChangeDialogSave() {
    const basicSettingsChangeDialogData = closeBasicSettingsChangeDialog();
    if (!basicSettingsChangeDialogData) {
      console.log("closeBasicSettingsChangeDialog returned null / undefined, which should never occur. Saving is aborted!");
      return;
    }
    let successMessage;
    const {settingsChangeTypeList, basicDetailsToSubmit} = basicSettingsChangeDialogData;
    if (settingsChangeTypeList.indexOf(SettingsChangeType.CHANGE_IN_DATE_WITH_REGISTERED_PARTICIPANTS) >= 0) {
      successMessage = <>
                        <div style={{ display: "block"}}>
                          <Trans i18nKey='admin:settings_saved_success'/>
                          <br />
                          <div>
                            <a href={generateParticipantMessagesPath(adminId, MessageSubType.RECIPIENTS_ALL)} style={{ color: 'white' }}>
                              <strong><Trans i18nKey='admin:mails_participant_sendmessage_button'/></strong>
                            </a>
                          </div>
                        </div>
                      </>;
    } else {
      successMessage = <Trans i18nKey='admin:settings_saved_success'/>;
    }
    await saveBasicDetailsAsync(basicDetailsToSubmit, successMessage);
  }

  async function saveBasicDetailsAsync(basicDetailsToSubmit: RunningDinnerBasicDetailsFormModel, successMessage: React.ReactNode) {
    try {
      const updatedRunningDinner = await updateBasicSettingsAsync(adminId, basicDetailsToSubmit);
      showSuccess(successMessage, { autoHideDuration: 6500 });
      onSettingsSaved(updatedRunningDinner);
    } catch(e) {
      // This is a little bit awkard, our backend sends us validation issues like this:
      // basicDetails.title
      // basicDetails.date
      // This is due to we do not send the basic-details directly, but encapsulated into a wrapper object, like this:
      // { basicDetails: {...}, teamPartnerWishDisabled: ..., ...}
      // Hence, we manually map our issue-fields back again to top-level properties, so that they apply to our form:
      const validationBackendIssues = getBackendIssuesFromErrorResponse(e as HttpError, true);
      const mappedValidationBackendIssues = validationBackendIssues.map(issue => {
        const mappedField = issue.field ? issue.field.replace("basicDetails.", "") : issue.field;
        return { ...issue, field: mappedField }
      });
      applyValidationIssuesToForm(newHttpError((e as HttpError)?.response?.status || 500, mappedValidationBackendIssues), setError);
      showHttpErrorDefaultNotification(e as HttpError);
    }
  }

  return (
    <>
      <FormProvider {...formMethods}>
        <form>
          <SpacingGrid container>
            <SpacingGrid item>
              <BasicDinnerSettingsFormControl registrationTypes={registrationTypes} />
            </SpacingGrid>
          </SpacingGrid>
          <SpacingGrid container justify={"flex-end"}>
            <SpacingGrid item pt={3}>
              <PrimaryButton disabled={formState.isSubmitting} size={"large"} onClick={handleSubmit(handleSubmitBasicDetailsAsync)}>
                { t('common:save') }
              </PrimaryButton>
            </SpacingGrid>
          </SpacingGrid>
        </form>
      </FormProvider>
      { isBasicSettngsChangeDialogOpen && <BasicSettingsChangeDialog onCancel={closeBasicSettingsChangeDialog} 
                                                                     onSave={handleBasicSettingsChangeDialogSave}
                                                                     basicSettingsChangeDialogData={getBasicSettingsChangeDialogData()} /> }
    </>
  );
}

export function PublicDinnerSettingsView({runningDinner, onSettingsSaved}: BasicDinnerSettingsViewProps) {

  const {t} = useTranslation(['common', 'admin']);

  const {publicSettings, adminId} = runningDinner;
  
  const {showSuccess} = useCustomSnackbar();

  const formMethods = useForm({
    defaultValues: newEmptyRunningDinnerPublicSettings(),
    mode: 'onTouched'
  });
  const { clearErrors, setError, handleSubmit, reset, formState } = formMethods;

  React.useEffect(() => {
    reset({
      ...publicSettings
    });
    clearErrors();
  }, [publicSettings, reset, clearErrors]);

  const {applyValidationIssuesToForm} = useBackendIssueHandler();
  const {showHttpErrorDefaultNotification} = useNotificationHttpError();

  async function handleSubmitPublicSettingsAsync(values: RunningDinnerPublicSettings) {
    clearErrors();
    const publicSettingsToSubmit = { ...values };
    const updatedRunningDinner = await updatePublicSettingsAsync(adminId, publicSettingsToSubmit);
    showSuccess(t("admin:settings_saved_success"));
    onSettingsSaved(updatedRunningDinner);
  }

  return (
    <>
      <FormProvider {...formMethods}>
        <form>
          <SpacingGrid container>
            <SpacingGrid item>
              {/* <PublicDinnerSettingsFormControl /> */}
              TODO
            </SpacingGrid>
          </SpacingGrid>
          <SpacingGrid container justify={"flex-end"}>
            <SpacingGrid item pt={3}>
              <PrimaryButton disabled={formState.isSubmitting} size={"large"} onClick={handleSubmit(handleSubmitPublicSettingsAsync)}>
                { t('common:save') }
              </PrimaryButton>
            </SpacingGrid>
          </SpacingGrid>
        </form>
      </FormProvider>
    </>
  );
}