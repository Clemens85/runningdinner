import React from 'react';
import {
  CONSTANTS,
  isAcknowledgeRequired,
  isNotificationRequired,
  formatLocalDateWithSeconds,
  reSendRunningDinnerCreatedMessageAsync,
  useDisclosure, useAdminSelector, getRunningDinnerFetchSelector, RunningDinner, 
  CallbackHandler, BaseRunningDinnerProps, ReSendRunningDinnerCreatedMessageModel
} from "@runningdinner/shared";
import {useTranslation} from "react-i18next";
import {Box} from "@material-ui/core";
import AlertCentered from "../../common/theme/AlertCentered";
import {FetchData} from "@runningdinner/shared/src/redux";
import LinkIntern from '../../common/theme/LinkIntern';
import LinkAction from '../../common/theme/LinkAction';
import { runningDinnerTheme } from '../../common/theme/RunningDinnerTheme';
import { FeedbackButton } from '../../common/feedback/FeedbackButton';

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

  if (!notificationRequired) {
    return null;
  }

  const runningDinner = runningDinnerFetchData.data!;
  const {cancellationDate, acknowledgedDate, runningDinnerType} = runningDinner;

  let notificationMessage = [];
  if (cancellationDate) {
    const cancellationDateFormatted = formatLocalDateWithSeconds(cancellationDate);
    notificationMessage.push(<Box key="cancellationDate">{t('notification_dinner_cancellation_text', { cancellationDate: cancellationDateFormatted })}</Box>);
  } else if (isAcknowledgeRequired(runningDinner)) {
    notificationMessage.push(<ReSendRunningDinnerCreatedMessageContainer key="acknowledgedDate" runningDinner={runningDinner} />);
  } else if (runningDinnerType === CONSTANTS.RUNNING_DINNER_TYPE.DEMO) {
    notificationMessage.push(<Box key="demo">{t("notification_dinner_demo_mode")}</Box>);
    if (!acknowledgedDate) {
      notificationMessage.push(<Box key="acknowledgedDate">{t("notification_dinner_acknowledge_required")}</Box>);
    }
  }

  let severity = !acknowledgedDate ? "warn" : "info";
  severity = cancellationDate ? "error" : severity;
 
  return (
      <>
        { isOpen && <AlertCentered severity={severity} icon={false} onClose={close}>
                      {notificationMessage}
                    </AlertCentered> }
      </>
  );
};

function ReSendRunningDinnerCreatedMessageContainer({runningDinner}: BaseRunningDinnerProps) {

  const {t} = useTranslation('admin');

  const {isOpen, close, open} = useDisclosure();

  return (
    <>
      <Box>
        {t("notification_dinner_acknowledge_required")}
        {t("Keine Mail bekommen?")} <LinkAction onClick={open}>Hier erneut versuchen</LinkAction>
      </Box>
      { isOpen && <ReSendRunningDinnerCreatedMessageDialog onClose={close} runningDinner={runningDinner} /> }
    </>
  )
}


type ReSendRunningDinnerCreatedMessageDialogProps {
  onClose: CallbackHandler;
}

function ReSendRunningDinnerCreatedMessageDialog({onClose, runningDinner}: ReSendRunningDinnerCreatedMessageDialogProps & BaseRunningDinnerProps) {
  
  const title = "Aktivierungs-Link erneut versenden";

  const {showSuccess} = useCustomSnackbar();
  
  const dispatch = useDispatch();

  const formMethods = useForm({
    defaultValues: {
      newEmailAddress: ""
    },
    mode: 'onTouched'
  });

  const { clearErrors, setError, reset } = formMethods;

  const {applyValidationIssuesToForm} = useBackendIssueHandler();
  const {showHttpErrorDefaultNotification} = useNotificationHttpError();

  React.useEffect(() => {
    reset(runningDinner.email);
    clearErrors();
  }, [reset, clearErrors, runningDinner.email]);

  
  const submitReSendRunningDinnerCreatedMessageAsync = async(values: ReSendRunningDinnerCreatedMessageModel) => {
    clearErrors();
    const valuesToSubmit = { ...values };
    try {
      const updatedRunningDinner = await reSendRunningDinnerCreatedMessageAsync(runningDinner.adminId, valuesToSubmit);
      onClose();
      showSuccess("Email mit Aktivierungs-Link wurde erneut versandt, bitte überprüfe dein Postfach. (Es kann einige Minuten dauern bis die Mail bei dir angekommen ist");
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
          <Trans i18nKey="Falls du die EMail mit dem Aktivierungslink nicht erhalten hast, kannst du sie dir hier erneut zuschicken lassen"
                 ns="admin"
                 components={{ italic: <em /> }} />
        </Span>
        <FormProvider {...formMethods}>
          <form>
            <Span>Du kannst deine verwendete EMail-Adresse hier auch nachträglich ändern, falls diese z.B. nicht korrekt war.</Span>
            <FormTextField name="newEmailAddress"
                           label={t('common:email' )}
                           variant="outlined"
                           fullWidth/>
          </form>
        </FormProvider>
        <Span>
          Falls es einfach nicht klappen will, wende dich bitte an uns: <FeedbackButton />
        </Span>
      </DialogContent>
      <DialogActionsPanel onOk={submitReSendRunningDinnerCreatedMessageAsync} 
                          onCancel={onClose} 
                          okLabel={"Senden"} cancelLabel={t('common:cancel')} />
    </Dialog>
  );
}

function isNotificationRequiredForFetchedRunningDinner(runningDinnerFetchData: FetchData<RunningDinner>) {
  return runningDinnerFetchData.data && isNotificationRequired(runningDinnerFetchData.data);
}