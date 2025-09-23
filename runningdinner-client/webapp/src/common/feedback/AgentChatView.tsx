import { Alert, Box, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { useEffect, useState } from 'react';
import { Feedback, isStringNotEmpty } from '@runningdinner/shared';
import { ChatInputTextField } from './ChatInputTextField.tsx';

type AgentChatViewProps = {
  sentFeedback: Feedback;
  incomingResponse?: string | null | undefined;
  incomingError?: Error | null | undefined;
};

export function AgentChatView({ sentFeedback, incomingResponse, incomingError }: AgentChatViewProps) {
  const [followUpQuestion, setFollowUpQuestion] = useState<string>('');
  const [sentFollowUpQuestion, setSentFollowUpQuestion] = useState<string>();
  const [error, setError] = useState<Error | undefined | null>();

  const showTypingIndicator = !incomingResponse && !error;
  const showResponses = !error && !showTypingIndicator && isStringNotEmpty(incomingResponse);

  useEffect(() => {
    setError(incomingError);
  }, [incomingError]);

  async function handleSendNextMessage(question: string) {
    // TODO
    console.log(question);
  }

  // Handle submit of follow-up question
  async function handleSendFollowUp() {
    const theFollowUpQuestion = followUpQuestion.trim();
    if (isStringNotEmpty(theFollowUpQuestion)) {
      setFollowUpQuestion('');
      await handleSendNextMessage(theFollowUpQuestion);
      setSentFollowUpQuestion(theFollowUpQuestion);
    }
  }

  return (
    <Grid container spacing={2}>
      <FeedbackSentSuccessAlert />

      <Grid item xs={12} sx={{ my: 1 }}>
        <ChatMessage text={sentFeedback.message} isAgentMessage={false} />
      </Grid>

      {showTypingIndicator && (
        <Grid item xs={12} sx={{ my: 1 }}>
          <TypingIndicator />
        </Grid>
      )}

      {error && <NoResponseAlert />}

      {showResponses && (
        <Grid item xs={12} sx={{ my: 1 }}>
          <ChatMessage text={incomingResponse} isAgentMessage={true} />
        </Grid>
      )}

      {sentFollowUpQuestion && showResponses && (
        <Grid item xs={12} sx={{ my: 1 }}>
          <ChatMessage text={sentFollowUpQuestion} isAgentMessage={false} />
        </Grid>
      )}

      {showResponses && (
        <Grid item xs={12}>
          <Box mt={2}>
            <ChatInputTextField inputMessage={followUpQuestion} onSendMessage={handleSendFollowUp} onInputMessageChange={setFollowUpQuestion} />
          </Box>
        </Grid>
      )}
    </Grid>
  );
}

function NoResponseAlert() {
  return (
    <Grid item xs={12}>
      <Alert severity={'info'} variant={'outlined'}>
        Leider konnte keine automatische Antwort für dein Anliegen gefunden werden. Du wirst jedoch zeitnah eine Antwort per Email erhalten.
      </Alert>
    </Grid>
  );
}

function FeedbackSentSuccessAlert() {
  const { t } = useTranslation('common');

  return (
    <Grid item xs={12}>
      <Alert severity="info" onClose={() => {}} variant="outlined" sx={{ mt: 2, mb: 1 }}>
        {t('common:feedback_success')}
      </Alert>
    </Grid>
  );
}
