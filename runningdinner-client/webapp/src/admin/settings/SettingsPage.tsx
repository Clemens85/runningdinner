import { Box, Button, Grid, useMediaQuery, useTheme } from '@mui/material';
import { Alert, AlertTitle } from '@mui/material';
import {
  AfterPartyLocation,
  BaseAdminIdProps,
  BaseRunningDinnerProps,
  cancelRunningDinnerAsync,
  deleteAfterPartyLocationAsync,
  findRegistrationTypesAsync,
  getBackendIssuesFromErrorResponse,
  getSettingsChangeTypeListAsync,
  HttpError,
  isAfterPartyLocationDefined,
  isArrayNotEmpty,
  isClosedDinner,
  isQuerySucceeded,
  LabelValue,
  MessageSubType,
  newAfterPartyLocation,
  newEmptyRunningDinnerBasicDetailsFormModel,
  newEmptyRunningDinnerPublicSettings,
  newHttpError,
  newObjectWithDefaultValuesIfNotSet,
  RunningDinner,
  RunningDinnerBasicDetailsFormModel,
  RunningDinnerPublicSettings,
  SettingsChangeType,
  setUpdatedRunningDinner,
  updateAfterPartyLocationAsync,
  updateBasicSettingsAsync,
  updatePublicSettingsAsync,
  updateRegistrationActiveState,
  useBackendIssueHandler,
  useDisclosure,
} from '@runningdinner/shared';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Trans, useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import { AfterPartyLocationFormControl } from '../../common/dinnersettings/AfterPartyLocationFormControl';
import { AfterPartyLocationToggleButton } from '../../common/dinnersettings/AfterPartyLocationToggleButton';
import { BasicDinnerSettingsFormControl } from '../../common/dinnersettings/BasicDinnerSettingsFormControl';
import { PublicDinnerSettingsFormControl } from '../../common/dinnersettings/PublicDinnerSettingsFormControl';
import { FetchProgressBar } from '../../common/FetchProgressBar';
import FormCheckbox from '../../common/input/FormCheckbox';
import { useNotificationHttpError } from '../../common/NotificationHttpErrorHook';
import { useCustomSnackbar } from '../../common/theme/CustomSnackbarHook';
import { ConfirmationDialog } from '../../common/theme/dialog/ConfirmationDialog';
import { PrimaryButton } from '../../common/theme/PrimaryButton';
import SecondaryButton from '../../common/theme/SecondaryButton';
import { PageTitle, Span, Subtitle } from '../../common/theme/typography/Tags';
import { useAdminNavigation } from '../AdminNavigationHook';
import { BasicSettingsChangeDialog, BasicSettingsChangeDialogData } from './BasicSettingsChangeDialog';

export function SettingsPage({ runningDinner }: BaseRunningDinnerProps) {
  const registrationTypesQuery = useQuery({
    queryFn: () => findRegistrationTypesAsync(),
    queryKey: ['findRegistrationTypes'],
  });

  if (!isQuerySucceeded(registrationTypesQuery)) {
    return <FetchProgressBar {...registrationTypesQuery} />;
  }
  return <SettingsViewController registrationTypes={registrationTypesQuery.data!} runningDinner={runningDinner} />;
}

export interface SettingsViewControllerProps extends BaseRunningDinnerProps {
  registrationTypes: LabelValue[];
}

function SettingsViewController({ runningDinner, registrationTypes }: SettingsViewControllerProps) {
  const { t } = useTranslation(['common', 'admin']);
  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('md'));

  const dispatch = useDispatch();

  const { showHttpErrorDefaultNotification } = useNotificationHttpError();

  const { open: openCancelEventDialog, isOpen: isCancelEventDialogOpen, close: closeCancelEventDialog } = useDisclosure();

  const { navigateToParticipantMessages } = useAdminNavigation();

  const [currentRunningDinner, setCurrentRunningDinner] = useState(runningDinner);

  function handleRunningDinnerUpdated(updatedRunningDinner: RunningDinner) {
    setCurrentRunningDinner(updatedRunningDinner);
    dispatch(setUpdatedRunningDinner(updatedRunningDinner));
  }

  async function handleCancelEventDialogClose(confirmed: boolean) {
    if (!confirmed) {
      closeCancelEventDialog();
      return;
    }
    try {
      const { adminId } = currentRunningDinner;
      const updatedRunningDinner = await cancelRunningDinnerAsync(adminId);
      handleRunningDinnerUpdated(updatedRunningDinner);
      closeCancelEventDialog();
      navigateToParticipantMessages(adminId, MessageSubType.RECIPIENTS_ALL);
    } catch (e) {
      showHttpErrorDefaultNotification(e as HttpError);
    }
  }

  function renderCancelEventDialogContent() {
    return (
      <Alert severity="error" variant="outlined">
        <AlertTitle>{t('attention')}</AlertTitle>
        <Span i18n="admin:event_cancel_text_1" />
        <Span i18n="admin:event_cancel_text_2" />
        <Span i18n="admin:event_cancel_text_3" />
        {!isClosedDinner(currentRunningDinner) && <Span i18n="admin:event_cancel_text_no_registration_hint" />}
        <Span>
          <em>{t('admin:event_cancel_send_messages_hint')}</em>
        </Span>
      </Alert>
    );
  }

  const paddingRightOfLeftCol = !isMobileDevice ? 6 : undefined;

  return (
    <>
      <PageTitle>{t('common:settings')}</PageTitle>
      {!currentRunningDinner.cancellationDate && (
        <Grid container>
          <Grid sx={{ mt: -2, pb: 1, textAlign: 'right' }} size={12}>
            <Button onClick={openCancelEventDialog} color="secondary">
              {t('admin:settings_cancel_event')}
            </Button>
          </Grid>
        </Grid>
      )}
      <Grid container>
        <Grid
          sx={{ pr: paddingRightOfLeftCol }}
          size={{
            xs: 12,
            md: 7
          }}>
          <BasicDinnerSettingsView registrationTypes={registrationTypes} runningDinner={currentRunningDinner} onSettingsSaved={handleRunningDinnerUpdated} />
          <AfterPartyLocationSettingsView runningDinner={currentRunningDinner} onSettingsSaved={handleRunningDinnerUpdated} />
        </Grid>
        {!isClosedDinner(currentRunningDinner) && (
          <Grid
            size={{
              xs: 12,
              md: 5
            }}>
            <PublicDinnerSettingsView runningDinner={currentRunningDinner} onSettingsSaved={handleRunningDinnerUpdated} />
          </Grid>
        )}
      </Grid>
      {isCancelEventDialogOpen && (
        <ConfirmationDialog
          onClose={handleCancelEventDialogClose}
          dialogContent={renderCancelEventDialogContent()}
          dialogTitle={t('admin:event_cancel_headline')}
          danger={true}
          buttonConfirmText={t('common:save')}
          buttonCancelText={t('common:cancel')}
        />
      )}
    </>
  );
}

type OnSettingsSavedCallback = {
  onSettingsSaved: (runningDinner: RunningDinner) => unknown;
};

function BasicDinnerSettingsView({ runningDinner, registrationTypes, onSettingsSaved }: SettingsViewControllerProps & OnSettingsSavedCallback) {
  const { t } = useTranslation(['common', 'admin']);

  const { basicDetails, adminId } = runningDinner;

  const { showSuccess } = useCustomSnackbar();

  const { generateParticipantMessagesPath } = useAdminNavigation();

  const {
    open: openBasicSettingsChangeDialog,
    isOpen: isBasicSettngsChangeDialogOpen,
    getIsOpenData: getBasicSettingsChangeDialogData,
    close: closeBasicSettingsChangeDialog,
  } = useDisclosure<BasicSettingsChangeDialogData>();

  const formMethods = useForm({
    defaultValues: newEmptyRunningDinnerBasicDetailsFormModel(),
    mode: 'onTouched',
  });
  const { clearErrors, setError, handleSubmit, reset, formState } = formMethods;

  React.useEffect(() => {
    reset({
      ...basicDetails,
      teamPartnerWishDisabled: runningDinner.options.teamPartnerWishDisabled,
    });
    clearErrors();
  }, [basicDetails, runningDinner.options.teamPartnerWishDisabled, reset, clearErrors]);

  const { applyValidationIssuesToForm } = useBackendIssueHandler();
  const { showHttpErrorDefaultNotification } = useNotificationHttpError();

  async function handleSubmitBasicDetailsAsync(values: RunningDinnerBasicDetailsFormModel) {
    clearErrors();
    const basicDetailsToSubmit = { ...values };

    const settingsChangeTypeList = await getSettingsChangeTypeListAsync(basicDetails, basicDetailsToSubmit, adminId);
    if (isArrayNotEmpty(settingsChangeTypeList)) {
      openBasicSettingsChangeDialog({
        settingsChangeTypeList,
        basicDetailsToSubmit,
      });
    } else {
      await saveBasicDetailsAsync(basicDetailsToSubmit, t('admin:settings_saved_success'));
    }
  }

  async function handleBasicSettingsChangeDialogSave() {
    const basicSettingsChangeDialogData = closeBasicSettingsChangeDialog();
    if (!basicSettingsChangeDialogData) {
      console.log('closeBasicSettingsChangeDialog returned null / undefined, which should never occur. Saving is aborted!');
      return;
    }
    let successMessage;
    const { settingsChangeTypeList, basicDetailsToSubmit } = basicSettingsChangeDialogData;
    if (settingsChangeTypeList.indexOf(SettingsChangeType.CHANGE_IN_DATE_WITH_REGISTERED_PARTICIPANTS) >= 0) {
      successMessage = (
        <>
          <Trans i18nKey="admin:settings_saved_success" />
          <br />
          <div>
            <a href={generateParticipantMessagesPath(adminId, MessageSubType.RECIPIENTS_ALL)} style={{ color: 'white' }}>
              <strong>
                <Trans i18nKey="admin:mails_participant_sendmessage_button" />
              </strong>
            </a>
          </div>
        </>
      );
    } else {
      successMessage = <Trans i18nKey="admin:settings_saved_success" />;
    }
    await saveBasicDetailsAsync(basicDetailsToSubmit, successMessage);
  }

  async function saveBasicDetailsAsync(basicDetailsToSubmit: RunningDinnerBasicDetailsFormModel, successMessage: React.ReactNode) {
    try {
      const updatedRunningDinner = await updateBasicSettingsAsync(adminId, basicDetailsToSubmit);
      showSuccess(successMessage, { autoHideDuration: 6500, wrapInHtmlContainer: true });
      onSettingsSaved(updatedRunningDinner);
    } catch (e) {
      // This is a little bit awkard, our backend sends us validation issues like this:
      // basicDetails.title
      // basicDetails.date
      // This is due to we do not send the basic-details directly, but encapsulated into a wrapper object, like this:
      // { basicDetails: {...}, teamPartnerWishDisabled: ..., ...}
      // Hence, we manually map our issue-fields back again to top-level properties, so that they apply to our form:
      const validationBackendIssues = getBackendIssuesFromErrorResponse(e as HttpError, true);
      const mappedValidationBackendIssues = validationBackendIssues.map((issue) => {
        const mappedField = issue.field ? issue.field.replace('basicDetails.', '') : issue.field;
        return { ...issue, field: mappedField };
      });
      applyValidationIssuesToForm(newHttpError((e as HttpError)?.response?.status || 500, mappedValidationBackendIssues), setError);
      showHttpErrorDefaultNotification(e as HttpError);
    }
  }

  return (
    <>
      <FormProvider {...formMethods}>
        <form>
          <Grid container>
            <Grid>
              <Box pb={2}>
                <Subtitle i18n="admin:settings_basics" />
              </Box>
              <BasicDinnerSettingsFormControl registrationTypes={registrationTypes} />
            </Grid>
          </Grid>
          <Grid container>
            <Grid sx={{ mt: 2 }} size={12}>
              <FormCheckbox
                name="teamPartnerWishDisabled"
                label={<Trans i18nKey="team_partner_wish_disabled" ns="common" />}
                helperText={t('common:team_partner_wish_disabled_help')}
              />
            </Grid>
          </Grid>
          <Grid container justifyContent={'flex-end'}>
            <Grid sx={{ pt: 3, pb: 6 }}>
              <PrimaryButton disabled={formState.isSubmitting} size={'large'} onClick={handleSubmit(handleSubmitBasicDetailsAsync)}>
                {t('common:save')}
              </PrimaryButton>
            </Grid>
          </Grid>
        </form>
      </FormProvider>
      {isBasicSettngsChangeDialogOpen && (
        <BasicSettingsChangeDialog
          onCancel={closeBasicSettingsChangeDialog}
          onSave={handleBasicSettingsChangeDialogSave}
          basicSettingsChangeDialogData={getBasicSettingsChangeDialogData()}
        />
      )}
    </>
  );
}

function PublicDinnerSettingsView({ runningDinner, onSettingsSaved }: BaseRunningDinnerProps & OnSettingsSavedCallback) {
  const { t } = useTranslation(['common', 'admin']);

  const { publicSettings, adminId } = runningDinner;

  const { showSuccess } = useCustomSnackbar();

  const { open: openUpdateRegistrationStateDialog, isOpen: isUpdateRegistrationStateDialogOpen, close: closeUpdateRegistrationStateDialog } = useDisclosure();

  const defaultValues = newEmptyRunningDinnerPublicSettings(runningDinner.basicDetails.date);
  const formMethods = useForm({
    defaultValues,
    mode: 'onTouched',
  });
  const { clearErrors, setError, handleSubmit, reset, formState } = formMethods;

  React.useEffect(() => {
    const publicSettingsToUse = newObjectWithDefaultValuesIfNotSet(publicSettings, defaultValues);
    reset({
      ...publicSettingsToUse,
    });
    clearErrors();
    // eslint-disable-next-line
  }, [publicSettings, reset, clearErrors]);

  const { applyValidationIssuesToForm } = useBackendIssueHandler();
  const { showHttpErrorDefaultNotification } = useNotificationHttpError();

  async function handleSubmitPublicSettingsAsync(values: RunningDinnerPublicSettings) {
    clearErrors();
    try {
      const publicSettingsToSubmit = { ...values };
      const updatedRunningDinner = await updatePublicSettingsAsync(adminId, publicSettingsToSubmit);
      showSuccess(t('admin:settings_saved_success'));
      onSettingsSaved(updatedRunningDinner);
    } catch (e) {
      applyValidationIssuesToForm(e as HttpError, setError);
      showHttpErrorDefaultNotification(e as HttpError);
    }
  }

  async function handleUpdateRegistrationDialogSubmit(confirmed: boolean) {
    closeUpdateRegistrationStateDialog();
    if (!confirmed) {
      return;
    }
    try {
      const enable = !!runningDinner.publicSettings.registrationDeactivated; // This causes the toggling
      const updatedRunningDinner = await updateRegistrationActiveState(adminId, enable);
      showSuccess(t('admin:settings_saved_success'));
      onSettingsSaved(updatedRunningDinner);
    } catch (e) {
      showHttpErrorDefaultNotification(e as HttpError);
    }
  }

  function getUpdateRegistrationStateLabel() {
    const { registrationDeactivated } = runningDinner.publicSettings;
    return registrationDeactivated ? t(`admin:activate_registration`) : t(`admin:deactivate_registration`);
  }

  function getUpdateRegistrationStateDialogContentl() {
    const { registrationDeactivated } = runningDinner.publicSettings;
    return registrationDeactivated ? t(`admin:activate_registration_confirmation_text`) : t(`admin:deactivate_registration_confirmation_text`);
  }

  return (
    <>
      <FormProvider {...formMethods}>
        <form>
          <Grid container>
            <Grid size={12}>
              <Box pb={2}>
                <Subtitle i18n="admin:settings_public_registration" />
              </Box>
              <PublicDinnerSettingsFormControl mediumDeviceHalfSize={false} />
            </Grid>
          </Grid>
          <Grid container justifyContent={'flex-end'}>
            <Grid sx={{ pt: 3, pb: 6 }}>
              <SecondaryButton onClick={openUpdateRegistrationStateDialog}>{getUpdateRegistrationStateLabel()}...</SecondaryButton>
              <PrimaryButton disabled={formState.isSubmitting} size={'large'} onClick={handleSubmit(handleSubmitPublicSettingsAsync)} sx={{ ml: 2 }}>
                {t('common:save')}
              </PrimaryButton>
            </Grid>
          </Grid>
        </form>
        {isUpdateRegistrationStateDialogOpen && (
          <ConfirmationDialog
            onClose={handleUpdateRegistrationDialogSubmit}
            dialogContent={getUpdateRegistrationStateDialogContentl()}
            dialogTitle={getUpdateRegistrationStateLabel()}
            buttonConfirmText={'Ok'}
            buttonCancelText={t('common:cancel')}
          />
        )}
      </FormProvider>
    </>
  );
}

function AfterPartyLocationSettingsView({ runningDinner, onSettingsSaved }: BaseRunningDinnerProps & OnSettingsSavedCallback) {
  const { adminId } = runningDinner;

  const { showSuccess } = useCustomSnackbar();
  const { t } = useTranslation(['admin', 'common']);

  const [currentAfterPartyLocation, setCurrentAfterPartyLocation] = useState(
    isAfterPartyLocationDefined(runningDinner.afterPartyLocation) ? runningDinner.afterPartyLocation : undefined,
  );

  const { open: openDeleteConfirmationDialog, isOpen: isDeleteConfirmationDialogOpen, close: closeDeleteConfirmationDialog } = useDisclosure();

  async function handleToggleAfterPartyLocation(enable: boolean) {
    if (enable) {
      setCurrentAfterPartyLocation(isAfterPartyLocationDefined(runningDinner.afterPartyLocation) ? runningDinner.afterPartyLocation : newAfterPartyLocation(runningDinner));
    } else {
      if (!isAfterPartyLocationDefined(runningDinner.afterPartyLocation)) {
        setCurrentAfterPartyLocation(undefined);
        return;
      } else {
        openDeleteConfirmationDialog();
      }
    }
  }

  async function handleDeleteAfterPartyLocation(confirmed: boolean) {
    if (!confirmed) {
      closeDeleteConfirmationDialog();
      return;
    }
    const updatedRunningDinner = await deleteAfterPartyLocationAsync(adminId);
    showSuccess(t('admin:settings_saved_success'));
    closeDeleteConfirmationDialog();
    setCurrentAfterPartyLocation(undefined);
    onSettingsSaved(updatedRunningDinner);
  }

  return (
    <>
      <AfterPartyLocationToggleButton afterPartyLocationEnabled={!!currentAfterPartyLocation} onToggleAfterPartyLocation={handleToggleAfterPartyLocation} mb={3} />
      {currentAfterPartyLocation && <AfterPartyLocationFormView afterPartyLocation={currentAfterPartyLocation} adminId={adminId} onSettingsSaved={onSettingsSaved} />}
      {isDeleteConfirmationDialogOpen && (
        <ConfirmationDialog
          buttonConfirmText={t('common:delete')}
          onClose={handleDeleteAfterPartyLocation}
          danger={true}
          dialogTitle={t('common:after_party_location_remove')}
          dialogContent={t('common:after_party_location_remove_confirmation')}
        />
      )}
    </>
  );
}

type AfterPartyLocationFormViewProps = {
  afterPartyLocation: AfterPartyLocation;
} & OnSettingsSavedCallback &
  BaseAdminIdProps;

function AfterPartyLocationFormView({ adminId, afterPartyLocation, onSettingsSaved }: AfterPartyLocationFormViewProps) {
  const { t } = useTranslation(['admin', 'common']);

  const { showSuccess } = useCustomSnackbar();

  const formMethods = useForm({
    defaultValues: afterPartyLocation,
    mode: 'onTouched',
  });
  const { clearErrors, setError, handleSubmit, reset, formState } = formMethods;

  React.useEffect(() => {
    if (afterPartyLocation) {
      reset({
        ...afterPartyLocation,
      });
    }
    clearErrors();
     
  }, [afterPartyLocation, reset, clearErrors]);

  const { applyValidationIssuesToForm } = useBackendIssueHandler();
  const { showHttpErrorDefaultNotification } = useNotificationHttpError();

  async function handleSubmitAfterPartyLocation(values: AfterPartyLocation) {
    clearErrors();
    try {
      const afterPartyLocationToSubmit = { ...values };
      const updatedRunningDinner = await updateAfterPartyLocationAsync(adminId, afterPartyLocationToSubmit);
      showSuccess(t('admin:settings_saved_success'));
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
          <AfterPartyLocationFormControl />
          <Grid container justifyContent={'flex-end'}>
            <Grid sx={{ pt: 3, pb: 6, justifyContent: 'flex-end' }}>
              <PrimaryButton disabled={formState.isSubmitting} size={'large'} onClick={handleSubmit(handleSubmitAfterPartyLocation)} sx={{ ml: 2 }}>
                {t('common:save')}
              </PrimaryButton>
            </Grid>
          </Grid>
        </form>
      </FormProvider>
    </>
  );
}
