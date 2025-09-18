import { useTranslation } from 'react-i18next';
import { DialogTitleCloseable } from '../theme/DialogTitleCloseable';
import { Box, Dialog, DialogActions, DialogContent, useMediaQuery, useTheme } from '@mui/material';
import { CallbackHandler, Feedback, FeedbackData, HttpError, newEmptyFeedbackInstance, useBackendIssueHandler } from '@runningdinner/shared';
import { useNotificationHttpError } from '../NotificationHttpErrorHook';
import { FormProvider, useForm } from 'react-hook-form';
import { saveFeedbackAsync } from '@runningdinner/shared/src/feedback/FeedbackService';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { ContactFormView } from './ContactFormView';
import { AgentChatView } from './AgentChatView';
import SecondaryButton from '../theme/SecondaryButton';
import { PrimarySuccessButtonAsync } from '../theme/PrimarySuccessButtonAsync';
import { commonStyles } from '../theme/CommonStyles';

export interface FeedbackDialogProps {
  onClose: CallbackHandler;
}

export function FeedbackDialog({ onClose }: FeedbackDialogProps) {
  const { t } = useTranslation('common');
  const params = useParams<Record<string, string>>();

  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('md'));
  const fullWidthProps = isMobileDevice ? commonStyles.fullWidth : {};

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agentResponse, setAgentResponse] = useState<string | null>(null);
  const [sentFeedback, setSentFeedback] = useState<FeedbackData | null>(null);

  const { applyValidationIssuesToForm, getIssuesTranslated } = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: 'common',
    },
  });
  const { showHttpErrorDefaultNotification } = useNotificationHttpError(getIssuesTranslated);

  const formMethods = useForm<FeedbackData>({
    defaultValues: newEmptyFeedbackInstance(),
    mode: 'onTouched',
  });
  const { handleSubmit, clearErrors, setError } = formMethods;

  async function handleSubmitFeedback(values: FeedbackData) {
    const feedback: Feedback = { ...values };
    clearErrors();
    setIsSubmitting(true);

    try {
      feedback.adminId = params.adminId;
      feedback.pageName = getCurrentPageName();

      // Simulate request to our endpoint and response from AI agent
      setTimeout(() => {
        const responseText =
          "Thank you for your feedback! I've reviewed your message and have forwarded it to our support team. They will look into your request and get back to you via email if needed. Is there anything else I can help you with?";

        setAgentResponse(responseText);
      }, 8000);

      await saveFeedbackAsync(feedback);
      setSentFeedback(feedback);
    } catch (e) {
      const httpError = e as HttpError;
      applyValidationIssuesToForm(httpError, setError);
      showHttpErrorDefaultNotification(httpError);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCloseFromAgentView() {
    alert('TODO: Ask user if he wants a response via email or if his request is satisfied');
    onClose();
  }

  const showFeedbackContactForm = !sentFeedback;

  return (
    <Dialog onClose={onClose} open={true} maxWidth="md">
      <DialogTitleCloseable onClose={onClose}>{t('common:feedback_label')}</DialogTitleCloseable>
      <DialogContent>
        <FormProvider {...formMethods}>
          <form>
            {showFeedbackContactForm && <ContactFormView />}
            {!showFeedbackContactForm && <AgentChatView sentFeedback={sentFeedback} response={agentResponse} />}
          </form>
        </FormProvider>
      </DialogContent>

      <DialogActions>
        {showFeedbackContactForm && (
          <Box sx={{ ...fullWidthProps, p: 2 }}>
            <SecondaryButton onClick={onClose} sx={fullWidthProps} data-testid="dialog-cancel">
              {t('common:cancel')}
            </SecondaryButton>
            :{' '}
            <PrimarySuccessButtonAsync disabled={isSubmitting} onClick={handleSubmit(handleSubmitFeedback)} size={'medium'} sx={fullWidthProps} data-testid="dialog-submit">
              {t('common:save')}
            </PrimarySuccessButtonAsync>
          </Box>
        )}

        {!showFeedbackContactForm && (
          <Box sx={{ ...fullWidthProps, p: 2 }}>
            <SecondaryButton onClick={handleCloseFromAgentView} sx={fullWidthProps} data-testid="dialog-close-agent">
              {t('common:close')}
            </SecondaryButton>
          </Box>
        )}
      </DialogActions>

      {/* <DialogActionsPanel
        onOk={handleSubmit(handleSubmitFeedback)}
        onCancel={onClose}
        okLabel={t('common:save')}
        cancelLabel={t('common:cancel')}
        okButtonDisabled={isSubmitting || isAgentTyping || showFollowUpField || agentResponse !== null}
      /> */}
    </Dialog>
  );
}

function getCurrentPageName() {
  return window.location.pathname;
}
