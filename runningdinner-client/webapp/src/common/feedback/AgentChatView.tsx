import { Alert, Box, Grid, TextField, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { useState } from 'react';
import { Feedback } from '@runningdinner/shared';

type AgentChatViewProps = {
  sentFeedback: Feedback;
  response?: string | null | undefined;
  error?: Error | undefined;
};

export function AgentChatView({ sentFeedback, response, error }: AgentChatViewProps) {
  const { t } = useTranslation('common');
  const [followUpQuestion, setFollowUpQuestion] = useState<string>('');

  const isResponseLoading = !response && !error;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Alert severity="success" onClose={() => {}} variant="outlined" sx={{ mt: 2, mb: 1 }}>
          {t('common:feedback_success')}
        </Alert>
      </Grid>

      <Grid item xs={12} sx={{ my: 1 }}>
        <ChatMessage text={sentFeedback.message} isAgentMessage={false} />
      </Grid>

      {isResponseLoading && (
        <Grid item xs={12} sx={{ my: 1 }}>
          <TypingIndicator />
        </Grid>
      )}

      {response && (
        <Grid item xs={12} sx={{ my: 1 }}>
          <ChatMessage text={response} isAgentMessage={true} />
        </Grid>
      )}

      {response && (
        <Grid item xs={12}>
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              Hast du noch weitere Fragen oder Anmerkungen?
            </Typography>
            <TextField
              variant="outlined"
              name="followUpQuestion"
              fullWidth
              multiline
              rows={2}
              value={followUpQuestion}
              onChange={(e) => setFollowUpQuestion(e.target.value)}
              label="Nachricht"
              placeholder="Gibt eine Nachricht ein."
            />
          </Box>
        </Grid>
      )}
    </Grid>
  );
}
