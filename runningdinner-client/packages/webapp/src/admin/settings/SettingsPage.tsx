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
  MessageSubType,
  cancelRunningDinnerAsync,
  setUpdatedRunningDinner
} from "@runningdinner/shared";
import {useNotificationHttpError} from "../../common/NotificationHttpErrorHook";
import { SpacingGrid } from '../../common/theme/SpacingGrid';
import {BasicDinnerSettingsFormControl} from "../../common/dinnersettings/BasicDinnerSettingsFormControl";
import {Fetch} from "../../common/Fetch";
import {PageTitle, Span, Subtitle} from "../../common/theme/typography/Tags";
import {Trans, useTranslation} from "react-i18next";
import DateFnsUtils from "@date-io/date-fns";
import useDatePickerLocale from "../../common/date/DatePickerLocaleHook";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Box, Button, useMediaQuery, useTheme } from '@material-ui/core';
import {PrimaryButton} from "../../common/theme/PrimaryButton";
import { useCustomSnackbar } from '../../common/theme/CustomSnackbarHook';
import { BasicSettingsChangeDialog, BasicSettingsChangeDialogData } from './BasicSettingsChangeDialog';
import { useAdminNavigation } from '../AdminNavigationHook';
import { PublicDinnerSettingsFormControl } from '../../common/dinnersettings/PublicDinnerSettingsFormControl';
import useCommonStyles from '../../common/theme/CommonStyles';
import SecondaryButton from '../../common/theme/SecondaryButton';
import { ConfirmationDialog } from '../../common/theme/dialog/ConfirmationDialog';
import { Alert, AlertTitle } from '@material-ui/lab';
import { useDispatch } from 'react-redux';

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

  const {t} = useTranslation(['common', 'admin']);
  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('sm'));
  const commonStyles = useCommonStyles();

  const dispatch = useDispatch();

  const {showHttpErrorDefaultNotification} = useNotificationHttpError();

  const {open: openCancelEventDialog, isOpen: isCancelEventDialogOpen, close: closeCancelEventDialog} = useDisclosure();

  const {navigateToParticipantMessages} = useAdminNavigation();

  const [currentRunningDinner, setCurrentRunningDinner] = useState(runningDinner);

  function handleRunningDinnerUpdated(updatedRunningDinner: RunningDinner) {
    setCurrentRunningDinner(updatedRunningDinner);
  }

  async function handleCancelEventDialogClose(confirmed: boolean) {
    if (!confirmed) {
      closeCancelEventDialog();
      return;
    }
    try {
      const {adminId} = currentRunningDinner;
      const updatedRunningDinner = await cancelRunningDinnerAsync(adminId);
      handleRunningDinnerUpdated(updatedRunningDinner);
      closeCancelEventDialog();
      dispatch(setUpdatedRunningDinner(updatedRunningDinner));
      navigateToParticipantMessages(adminId, MessageSubType.RECIPIENTS_ALL);
    } catch (e) {
      showHttpErrorDefaultNotification(e as HttpError);
    }
  }

  function renderCancelEventDialogContent() {
    return (
      <Alert severity="error" variant="outlined">
        <AlertTitle>{t('attention')}</AlertTitle>
        <Span i18n='admin:event_cancel_text_1'/>
        <Span i18n='admin:event_cancel_text_2'/>
        <Span i18n='admin:event_cancel_text_3'/>
        { !isClosedDinner(currentRunningDinner) && <Span i18n='admin:event_cancel_text_no_registration_hint'/> }
        <Span><em>{t('admin:event_cancel_send_messages_hint')}</em></Span>
      </Alert>
    );
  }

  return (
    <>
      <PageTitle>{t('common:settings')}</PageTitle>
      { !currentRunningDinner.cancellationDate && 
        <SpacingGrid container>
          <SpacingGrid item xs={12} className={commonStyles.textAlignRight} mt={-2} pb={1}>
            <Button onClick={openCancelEventDialog} color="secondary">{t('admin:settings_cancel_event')}</Button>
          </SpacingGrid>
        </SpacingGrid> 
      }
      <SpacingGrid container>
        <SpacingGrid item xs={12} md={7} pr={!isMobileDevice ? 6 : undefined}>
          <BasicDinnerSettingsView registrationTypes={registrationTypes} runningDinner={currentRunningDinner} onSettingsSaved={handleRunningDinnerUpdated} />
        </SpacingGrid>
        { !isClosedDinner(currentRunningDinner) &&
          <SpacingGrid item xs={12} md={5}>
            <PublicDinnerSettingsView runningDinner={currentRunningDinner} onSettingsSaved={handleRunningDinnerUpdated} registrationTypes={registrationTypes}/>
          </SpacingGrid>
        }
      </SpacingGrid>
      { isCancelEventDialogOpen && <ConfirmationDialog onClose={handleCancelEventDialogClose} 
                                                       dialogContent={renderCancelEventDialogContent()}
                                                       dialogTitle={t('admin:event_cancel_headline')}
                                                       danger={true}
                                                       buttonConfirmText={t('common:save')}
                                                       buttonCancelText={t('common:cancel')} /> }
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
              <Box pb={2}>
                <Subtitle i18n="admin:settings_basics"/>
              </Box>
              <BasicDinnerSettingsFormControl registrationTypes={registrationTypes} />
            </SpacingGrid>
          </SpacingGrid>
          <SpacingGrid container justify={"flex-end"}>
            <SpacingGrid item pt={3} pb={6}>
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

  const commonStyles = useCommonStyles();

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
    try {
      const publicSettingsToSubmit = { ...values };
      const updatedRunningDinner = await updatePublicSettingsAsync(adminId, publicSettingsToSubmit);
      showSuccess(t("admin:settings_saved_success"));
      onSettingsSaved(updatedRunningDinner);
    } catch (e) {
      applyValidationIssuesToForm(e as HttpError, setError);
      showHttpErrorDefaultNotification(e as HttpError);
    }
  }

  return (
    <>
      <FormProvider {...formMethods}>
        <form>
          <SpacingGrid container>
            <SpacingGrid item xs={12}>
              <Box pb={2}>
                <Subtitle i18n="admin:settings_public_registration"/>
              </Box>
              <PublicDinnerSettingsFormControl />
            </SpacingGrid>
          </SpacingGrid>
          <SpacingGrid container justify={"flex-end"}>
            <SpacingGrid item pt={3} pb={6}>
              <SecondaryButton>{t('admin:deactivate_registration')}</SecondaryButton>
              <PrimaryButton disabled={formState.isSubmitting} size={"large"} onClick={handleSubmit(handleSubmitPublicSettingsAsync)} 
                             className={commonStyles.buttonSpacingLeft}>
                { t('common:save') }
              </PrimaryButton>
            </SpacingGrid>
          </SpacingGrid>
        </form>
      </FormProvider>
    </>
  );
}