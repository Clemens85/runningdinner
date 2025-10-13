import { useTranslation } from 'react-i18next';
import { DialogTitleCloseable } from '../theme/DialogTitleCloseable';
import { Box, Dialog, DialogActions, DialogContent, useMediaQuery, useTheme } from '@mui/material';
import {
  CallbackHandler,
  Feedback,
  FeedbackData,
  HttpError,
  newEmptyFeedbackInstance,
  useBackendIssueHandler,
  querySupportBotFromFeedback,
  saveFeedbackAsync,
  warmupSupportBot,
  SupportBotQueryResponse,
} from '@runningdinner/shared';
import { useNotificationHttpError } from '../NotificationHttpErrorHook';
import { FormProvider, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ContactFormView } from './ContactFormView';
import { AgentChatView } from './AgentChatView';
import SecondaryButton from '../theme/SecondaryButton';
import { PrimarySuccessButtonAsync } from '../theme/PrimarySuccessButtonAsync';
import { commonStyles } from '../theme/CommonStyles';
import { getPublicEventRegistrationsFromLocalStorage } from '../LocalStorageService';

export interface FeedbackDialogProps {
  onClose: CallbackHandler;
}

const initialFeedbackInstance = newEmptyFeedbackInstance();
initialFeedbackInstance.message =
  'Unterstützt das Tool auch kürzeste Wegen bei den Routen? Wir veranstalten ein Event in Berlin und da ist es wichtig, dass man nicht vom einem Rand zum anderen Rand muss. Lg Jan';

export function FeedbackDialog({ onClose }: FeedbackDialogProps) {
  const { t } = useTranslation('common');
  const params = useParams<Record<string, string>>();

  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('md'));
  const fullWidthProps = isMobileDevice ? commonStyles.fullWidth : {};

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agentResponse, setAgentResponse] = useState<SupportBotQueryResponse | null>(null);
  const [agentError, setAgentError] = useState<Error | null>(null);
  const [sentFeedback, setSentFeedback] = useState<FeedbackData | null>(null);

  const { applyValidationIssuesToForm, getIssuesTranslated } = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: 'common',
    },
  });
  const { showHttpErrorDefaultNotification } = useNotificationHttpError(getIssuesTranslated);

  const formMethods = useForm<FeedbackData>({
    defaultValues: initialFeedbackInstance, //newEmptyFeedbackInstance(),
    mode: 'onTouched',
  });
  const { handleSubmit, clearErrors, setError } = formMethods;

  useEffect(() => {
    warmupSupportBot();
  }, []);

  async function handleSubmitFeedback(values: FeedbackData) {
    const feedback: Feedback = { ...values };
    clearErrors();
    setIsSubmitting(true);

    try {
      feedback.adminId = params.adminId;
      feedback.pageName = getCurrentPageName();

      const publicEventRegistrations = getPublicEventRegistrationsFromLocalStorage();
      querySupportBotFromFeedback(feedback, feedback.message, publicEventRegistrations)
        .then((response) => {
          setAgentResponse(response);
        })
        .catch((error: Error) => {
          setAgentError(error);
        });

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
            {!showFeedbackContactForm && <AgentChatView sentFeedback={sentFeedback} incomingResponse={agentResponse} incomingError={agentError} />}
          </form>
        </FormProvider>
      </DialogContent>

      <DialogActions>
        {showFeedbackContactForm && (
          <Box sx={{ ...fullWidthProps, p: 2 }}>
            <SecondaryButton onClick={onClose} sx={fullWidthProps} data-testid="dialog-cancel">
              {t('common:cancel')}
            </SecondaryButton>{' '}
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
    </Dialog>
  );
}

function getCurrentPageName() {
  return window.location.pathname;
}
