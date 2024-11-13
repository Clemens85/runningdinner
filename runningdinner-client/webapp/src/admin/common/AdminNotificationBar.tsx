import React from 'react';
import {
  CONSTANTS,
  isAcknowledgeRequired,
  isNotificationRequired,
  formatLocalDateWithSeconds,
  reSendRunningDinnerCreatedMessageAsync,
  useDisclosure, useAdminSelector, getRunningDinnerFetchSelector, RunningDinner,
  CallbackHandler, BaseRunningDinnerProps, ReSendRunningDinnerCreatedMessageModel,
  useBackendIssueHandler, useAdminDispatch,
  setUpdatedRunningDinner,
  HttpError, newReSendRunningdinnerCreatedMessageModel,
  isDinnerExpired
} from "@runningdinner/shared";
import {Trans, useTranslation} from "react-i18next";
import {AlertColor, Box, Dialog, DialogContent, Grid} from "@mui/material";
import AlertCentered from "../../common/theme/AlertCentered";
import {FetchData} from "@runningdinner/shared/src/redux";
import LinkAction from '../../common/theme/LinkAction';
import { FeedbackButton } from '../../common/feedback/FeedbackButton';
import {useCustomSnackbar} from "../../common/theme/CustomSnackbarHook";
import {useNotificationHttpError} from "../../common/NotificationHttpErrorHook";
import {FormProvider, useForm} from "react-hook-form";
import {DialogTitleCloseable} from "../../common/theme/DialogTitleCloseable";
import { Span } from '../../common/theme/typography/Tags';
import FormTextField from '../../common/input/FormTextField';
import DialogActionsPanel from '../../common/theme/DialogActionsPanel';
import { GLOBAL_NOTIFICATION_BANNER_ENABLED, GlobalNotificationBanner, GlobalNotificationBannerApp } from '../../common/global-notification';

export default function AdminNotificationBar() {

  const {t} = useTranslation('admin');

  const runningDinnerFetchData = useAdminSelector(getRunningDinnerFetchSelector);
  const notificationRequired = isNotificationRequiredForFetchedRunningDinner(runningDinnerFetchData);

  // For now it is good enough to hold the state just locally (=> alert will disappear as long as user do not refresh browser)
  const {isOpen, close, open} = useDisclosure(notificationRequired);

  React.useEffect(() => {
    if (notificationRequired) {
      open();
    }
    // eslint-disable-next-line
  }, [notificationRequired]);


  if (!notificationRequired && !GLOBAL_NOTIFICATION_BANNER_ENABLED) {
    return null;
  }

  const runningDinner = runningDinnerFetchData.data!;
  if (!runningDinner) {
    return null;
  }

  const {cancellationDate, acknowledgedDate, runningDinnerType} = runningDinner;

  const acknowledgeRequired = isAcknowledgeRequired(runningDinner);
  const expired = isDinnerExpired(runningDinner, new Date());

  let notificationMessage = [];
  if (cancellationDate) {
    const cancellationDateFormatted = formatLocalDateWithSeconds(cancellationDate);
    notificationMessage.push(<Box key="cancellationDate">{t('notification_dinner_cancellation_text', { cancellationDate: cancellationDateFormatted })}</Box>);
    if (expired) {
      notificationMessage.push(<Box key="expired">{t("notification_dinner_expired")}</Box>);
    }
  } else if (acknowledgeRequired) {
    notificationMessage.push(<ReSendRunningDinnerCreatedMessageContainer key="acknowledgedDate" runningDinner={runningDinner} />);
  } else if (runningDinnerType === CONSTANTS.RUNNING_DINNER_TYPE.DEMO) {
    notificationMessage.push(<Box key="demo">{t("notification_dinner_demo_mode")}</Box>);
    if (!acknowledgedDate) {
      notificationMessage.push(<ReSendRunningDinnerCreatedMessageContainer key="acknowledgedDate" runningDinner={runningDinner} />);
    }
  } else if (expired) {
    notificationMessage.push(<Box key="expired">{t("notification_dinner_expired")}</Box>);
  }

  let severity:AlertColor = acknowledgeRequired ? "warning" : "info";
  severity = (cancellationDate || expired) ? "error" : severity;
 
  return (
      <>
        <GlobalNotificationBanner key="globalNotificationBanner" app={GlobalNotificationBannerApp.ADMIN} />
        { isOpen && <AlertCentered severity={severity} icon={false} onClose={close}>
                      {notificationMessage}
                    </AlertCentered> }
      </>
  );
};

function ReSendRunningDinnerCreatedMessageContainer({runningDinner}: BaseRunningDinnerProps) {

  const {t} = useTranslation('admin');

  const {isOpen, close, open} = useDisclosure();

  return <>
    <Grid container spacing={1} alignContent={"center"} justifyContent={"center"}>
      <Grid item>
        <Span>{t("notification_dinner_acknowledge_required")}</Span>
      </Grid>
      <Grid item>
        <Span>{t("admin:acknowledge_link_no_mail_received")}</Span>
      </Grid>
      <Grid item>
        <LinkAction onClick={open}><Span>{t("admin:acknowledge_link_no_mail_received_action")}</Span></LinkAction>
      </Grid>
    </Grid>
    { isOpen && <ReSendRunningDinnerCreatedMessageDialog onClose={close} runningDinner={runningDinner} /> }
  </>;
}


type ReSendRunningDinnerCreatedMessageDialogProps = {
  onClose: CallbackHandler;
};

function ReSendRunningDinnerCreatedMessageDialog({onClose, runningDinner}: ReSendRunningDinnerCreatedMessageDialogProps & BaseRunningDinnerProps) {
  
  const {showSuccess} = useCustomSnackbar();
  
  const dispatch = useAdminDispatch();
  const {t} = useTranslation(['admin', 'common']);

  const title = t("admin:acknowledge_link_resend_title");

  const formMethods = useForm({
    defaultValues: newReSendRunningdinnerCreatedMessageModel(""),
    mode: 'onTouched'
  });

  const { clearErrors, setError, reset, handleSubmit } = formMethods;

  const {applyValidationIssuesToForm} = useBackendIssueHandler();
  const {showHttpErrorDefaultNotification} = useNotificationHttpError();

  React.useEffect(() => {
    reset(newReSendRunningdinnerCreatedMessageModel(runningDinner.email));
    clearErrors();
  }, [reset, clearErrors, runningDinner.email]);

  
  const submitReSendRunningDinnerCreatedMessageAsync = async(values: ReSendRunningDinnerCreatedMessageModel) => {
    clearErrors();
    const valuesToSubmit = { ...values };
    try {
      const updatedRunningDinner = await reSendRunningDinnerCreatedMessageAsync(runningDinner.adminId, valuesToSubmit);
      onClose();
      showSuccess(t("admin:acknowledge_link_resend_success"), { autoHideDuration: 6500 });
      dispatch(setUpdatedRunningDinner(updatedRunningDinner));
    } catch(e) {
      applyValidationIssuesToForm(e as HttpError, setError);
      showHttpErrorDefaultNotification(e as HttpError);
    }
  };
  
  return (
    <Dialog open={true} onClose={onClose} aria-labelledby={title}>
      <DialogTitleCloseable onClose={onClose}>
         { title }
      </DialogTitleCloseable>
      <DialogContent>
        <Span>
          <Trans i18nKey="admin:acknowledge_link_resend_description"
                 ns="admin"
                 components={{ italic: <em /> }} />
        </Span>
        <FormProvider {...formMethods}>
          <form>
            <Span>{t("admin:acknowledge_link_resend_change_email")}</Span>
            <br />
            <FormTextField name="newEmailAddress"
                           label={t('common:email' )}
                           variant="outlined"
                           fullWidth/>
          </form>
        </FormProvider>
        <Box mt={3}>
          <Grid container alignContent={"center"} spacing={1}>
            <Grid item>
              <Span>{t("admin:acknowledge_link_resend_change_email_contact")}</Span>
            </Grid>
            <Grid item>
              <FeedbackButton showAsLinkWithoutIcon={true} labelOverridden={<Span>{t("common:contact_help")}</Span>}/>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActionsPanel onOk={handleSubmit(submitReSendRunningDinnerCreatedMessageAsync)}
                          onCancel={onClose} 
                          okLabel={t("admin:send")} cancelLabel={t('common:cancel')} />
    </Dialog>
  );
}

function isNotificationRequiredForFetchedRunningDinner(runningDinnerFetchData: FetchData<RunningDinner>) {
  return runningDinnerFetchData.data && isNotificationRequired(runningDinnerFetchData.data);
}