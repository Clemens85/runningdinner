import { Box, Dialog, DialogActions, DialogContent, useMediaQuery, useTheme } from '@mui/material';
import {
  CallbackHandler,
  Feedback,
  FeedbackData,
  FuzzyBoolean,
  HttpError,
  newEmptyFeedbackInstance,
  querySupportBotFromFeedback,
  saveFeedbackAsync,
  SupportBotQueryResponse,
  updateFeedbackResolvedStatus,
  useBackendIssueHandler,
  useDisclosure,
  warmupSupportBot,
} from '@runningdinner/shared';
import { useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { getPublicEventRegistrationsFromLocalStorage } from '../LocalStorageService';
import { useNotificationHttpError } from '../NotificationHttpErrorHook';
import { commonStyles } from '../theme/CommonStyles';
import { DialogTitleCloseable } from '../theme/DialogTitleCloseable';
import { PrimarySuccessButtonAsync } from '../theme/PrimarySuccessButtonAsync';
import SecondaryButton from '../theme/SecondaryButton';
import { AgentChatView } from './AgentChatView';
import { AgentChatViewCloseConfirmationDialog } from './AgentChatViewCloseConfirmationDialog.tsx';
import { ContactFormView } from './ContactFormView';

export interface FeedbackDialogProps {
  onClose: CallbackHandler;
}

function newTestFeedbackInstance() {
  const initialFeedbackInstance = newEmptyFeedbackInstance();
  initialFeedbackInstance.message =
    'Unterstützt das Tool auch kürzeste Wegen bei den Routen? Wir veranstalten ein Event in Berlin und da ist es wichtig, dass man nicht vom einem Rand zum anderen Rand muss. Lg Jan';
  return initialFeedbackInstance;
}

export function FeedbackDialog({ onClose }: FeedbackDialogProps) {
  const { t } = useTranslation('common');
  const params = useParams<Record<string, string>>();

  const theme = useTheme();
  const isMobileDevice = useMediaQuery(theme.breakpoints.down('md'));
  const fullWidthProps = isMobileDevice ? commonStyles.fullWidth : {};

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agentResponse, setAgentResponse] = useState<SupportBotQueryResponse | null>(null);
  const [agentError, setAgentError] = useState<Error | null>(null);
  const [sentFeedback, setSentFeedback] = useState<Feedback | null>(null);

  const { isOpen: isCloseConfirmationOpen, open: openCloseConfirmation, close: closeCloseConfirmation } = useDisclosure();

  const { applyValidationIssuesToForm, getIssuesTranslated } = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: 'common',
    },
  });
  const { showHttpErrorDefaultNotification } = useNotificationHttpError(getIssuesTranslated);

  const testFeedbackInstance = newTestFeedbackInstance();
  const formMethods = useForm<FeedbackData>({
    defaultValues: testFeedbackInstance, //newEmptyFeedbackInstance(),
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
    openCloseConfirmation();
  }

  async function handleCloseConfirmation(wantsEmailResponse: boolean) {
    closeCloseConfirmation();

    if (sentFeedback?.threadId) {
      const resolved = wantsEmailResponse ? FuzzyBoolean.FALSE : FuzzyBoolean.TRUE;
      try {
        await updateFeedbackResolvedStatus(sentFeedback.threadId, resolved);
      } catch (error) {
        console.error('Failed to update feedback resolved status:', error);
      }
    }

    onClose();
  }

  const showFeedbackContactForm = !sentFeedback;
  const useAgentChatViewCloseHandler = !!sentFeedback && !agentError && !!agentResponse;

  function handleCloseDialog() {
    if (useAgentChatViewCloseHandler) {
      handleCloseFromAgentView();
    } else {
      onClose();
    }
  }

  return (
    <>
      <Dialog
        onClose={(_, reason) => {
          if (reason !== 'backdropClick') {
            handleCloseDialog();
          }
        }}
        open={true}
        maxWidth="md"
      >
        <DialogTitleCloseable onClose={handleCloseDialog}>{t('common:feedback_label')}</DialogTitleCloseable>
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

          {useAgentChatViewCloseHandler && (
            <Box sx={{ ...fullWidthProps, p: 2 }}>
              <SecondaryButton onClick={handleCloseFromAgentView} sx={fullWidthProps} data-testid="dialog-close-agent">
                {t('common:close')}
              </SecondaryButton>
            </Box>
          )}
        </DialogActions>
      </Dialog>

      {isCloseConfirmationOpen && <AgentChatViewCloseConfirmationDialog open={isCloseConfirmationOpen} onConfirm={handleCloseConfirmation} />}
    </>
  );
}

function getCurrentPageName() {
  return window.location.pathname;
}
