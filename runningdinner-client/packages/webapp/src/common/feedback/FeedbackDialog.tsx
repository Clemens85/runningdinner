import React from 'react';
import {Trans, useTranslation} from "react-i18next";
import {DialogTitleCloseable} from "../theme/DialogTitleCloseable";
import {Span} from "../theme/typography/Tags";
import {Box, Dialog, DialogContent} from "@mui/material";
import {
  CallbackHandler,
  Feedback,
  FeedbackData,
  newEmptyFeedbackInstance,
  useBackendIssueHandler
} from "@runningdinner/shared";
import DialogActionsPanel from "../theme/DialogActionsPanel";
import {useNotificationHttpError} from "../NotificationHttpErrorHook";
import {FormProvider, useForm} from "react-hook-form";
import Grid from "@mui/material/Grid";
import FormTextField from "../input/FormTextField";
import LinkExtern from "../theme/LinkExtern";
import {IMPRESSUM_PATH} from "../mainnavigation/NavigationPaths";
import {saveFeedbackAsync} from "@runningdinner/shared/src/feedback/FeedbackService";
import {useParams} from "react-router-dom";
import {useCustomSnackbar} from "../theme/CustomSnackbarHook";


export interface FeedbackDialogProps {
  onClose: CallbackHandler;
}

export function FeedbackDialog({onClose}: FeedbackDialogProps) {

  const {t} = useTranslation("common");
  const params = useParams<Record<string, string>>();
  const {showSuccess} = useCustomSnackbar();

  const {applyValidationIssuesToForm, getIssuesTranslated} = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: 'common'
    }
  });
  const {showHttpErrorDefaultNotification} = useNotificationHttpError(getIssuesTranslated);

  const formMethods = useForm<FeedbackData>({
    defaultValues: newEmptyFeedbackInstance(),
    mode: 'onTouched'
  });
  const {handleSubmit, clearErrors, setError} = formMethods;

  async function handleSubmitFeedback(values: FeedbackData) {
    const feedback:Feedback = {...values};
    clearErrors();
    try {
      feedback.adminId = params.adminId;
      feedback.pageName = getCurrentPageName();
      await saveFeedbackAsync(feedback);
      showSuccess(t("common:feedback_success"));
      onClose();
    } catch (e) {
      applyValidationIssuesToForm(e, setError);
      showHttpErrorDefaultNotification(e);
    }
  }

  return (
    <Dialog onClose={onClose} open={true}>
      <DialogTitleCloseable onClose={onClose}>{t('common:feedback_label')}</DialogTitleCloseable>
      <DialogContent>
        <Box mb={2}>
          <Span><Trans i18nKey={"common:feedback_text"} /></Span>
        </Box>
        <FormProvider {...formMethods}>
          <form>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormTextField name="senderEmail"
                               label={t("common:email")}
                               required
                               variant="filled"
                               fullWidth/>
              </Grid>
              <Grid item xs={12}>
                <FormTextField required
                               variant="filled"
                               fullWidth
                               multiline
                               rows={9}
                               name="message"
                               label={t("common:content")}/>
              </Grid>
              <Grid item xs={12}>
                <small>
                  <Trans i18nKey={"common:feedback_privacy_text"}
                         values={{ impressumLink: `/${IMPRESSUM_PATH}` }}
                         // @ts-ignore
                         components={{ anchor: <LinkExtern /> }}/>
                </small>
              </Grid>
            </Grid>
          </form>
        </FormProvider>
      </DialogContent>
      <DialogActionsPanel onOk={handleSubmit(handleSubmitFeedback)}
                          onCancel={onClose}
                          okLabel={t('common:save')}
                          cancelLabel={t('common:cancel')} />
    </Dialog>
  );
}

function getCurrentPageName() {
  return window.location.pathname;
}