import { Alert, AlertTitle, Box, Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ChatMessageView } from './ChatMessageView.tsx';
import { TypingIndicator } from './TypingIndicator';
import { useEffect, useRef, useState } from 'react';
import { Feedback, isStringNotEmpty, newUuid, querySupportBot, SupportBotQueryResponse } from '@runningdinner/shared';
import { ChatInputTextField } from './ChatInputTextField.tsx';
import { ChatMessage, chatMessageFromFeedback, filterNonPendingMessages, hasAtLeastOnePendingMessage } from './ChatMessage.ts';
import EmailIcon from '@mui/icons-material/Email';

type AgentChatViewProps = {
  sentFeedback: Feedback;
  incomingResponse?: SupportBotQueryResponse | null | undefined;
  incomingError?: Error | null | undefined;
};

export function AgentChatView({ sentFeedback, incomingResponse, incomingError }: AgentChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([chatMessageFromFeedback(sentFeedback)]);
  const [followUpQuestion, setFollowUpQuestion] = useState<string>('');
  const [error, setError] = useState<Error | undefined | null>();

  // Ref for the scroll container
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Ref to track previous input height for comparison
  const previousInputHeightRef = useRef<number>(0);

  const showTypingIndicator = (!incomingResponse && !error) || hasAtLeastOnePendingMessage(messages);

  const nonPendingMessages = filterNonPendingMessages(messages);

  const showChatInputField = nonPendingMessages.length > 1; // Only show input field if there is at least one agent message

  useEffect(() => {
    setError(incomingError);
  }, [incomingError]);

  useEffect(() => {
    if (isStringNotEmpty(incomingResponse?.answer)) {
      const newAgentMessage: ChatMessage = {
        text: incomingResponse?.answer || '',
        isAgentMessage: true,
        pending: false,
        id: incomingResponse?.id || '',
      };
      setMessages((prevMessages) => [...filterNonPendingMessages(prevMessages), newAgentMessage]);
      // Scroll to bottom when bot reply arrives
      setTimeout(() => scrollToBottom(), 100);
    }
  }, [incomingResponse?.answer, incomingResponse?.id]);

  // Scroll to bottom when input field grows (multiline text)
  useEffect(() => {
    if (showChatInputField && followUpQuestion) {
      // Check if input contains line breaks or is getting long
      const lineCount = followUpQuestion.split('\n').length;
      const estimatedHeight = Math.max(lineCount * 24, 56); // Rough estimate of text field height

      if (estimatedHeight > previousInputHeightRef.current) {
        // Input field is growing, scroll to bottom
        setTimeout(() => scrollToBottom(), 50);
      }
      previousInputHeightRef.current = estimatedHeight;
    }
  }, [followUpQuestion, showChatInputField]);

  // Function to scroll to bottom smoothly
  function scrollToBottom() {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }

  async function handleSendFollowUp() {
    const theFollowUpQuestion = followUpQuestion.trim();
    if (isStringNotEmpty(theFollowUpQuestion)) {
      setFollowUpQuestion('');
      // Reset the height tracking when input is cleared
      previousInputHeightRef.current = 0;

      const agentPromise = querySupportBot(sentFeedback.threadId || '', theFollowUpQuestion, {});
      const newUserMessage: ChatMessage = {
        text: theFollowUpQuestion,
        isAgentMessage: false,
        pending: false,
        id: newUuid(),
      };
      const newAgentMessage: ChatMessage = {
        text: '',
        isAgentMessage: true,
        pending: true,
        id: newUuid(),
      };
      setMessages((prevMessages) => [...filterNonPendingMessages(prevMessages), newUserMessage, newAgentMessage]);

      // Scroll to bottom immediately after adding user message and typing indicator
      setTimeout(() => scrollToBottom(), 50);

      try {
        const agentAnswer = await agentPromise;
        setMessages((prevMessages) => {
          const nonPendingMessages = filterNonPendingMessages(prevMessages);
          // Remove the last pending agent message and replace it with the actual answer
          if (nonPendingMessages.length > 0 && nonPendingMessages[nonPendingMessages.length - 1].pending) {
            nonPendingMessages.pop();
          }
          return [...nonPendingMessages, { text: agentAnswer.answer, isAgentMessage: true, pending: false, id: agentAnswer.id }];
        });
        setError(null);
        // Scroll to bottom when bot reply is received
        setTimeout(() => scrollToBottom(), 100);
      } catch (error) {
        setError(error as Error);
      }
    }
  }

  return (
    <Box
      ref={scrollContainerRef}
      sx={{
        maxHeight: '70vh',
        overflowY: 'auto',
        scrollBehavior: 'smooth',
        pr: 2,
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'rgba(0,0,0,0.1)',
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(0,0,0,0.3)',
          borderRadius: '4px',
          '&:hover': {
            backgroundColor: 'rgba(0,0,0,0.5)',
          },
        },
      }}
    >
      <Grid container spacing={2}>
        <FeedbackSentSuccessAlert />

        {nonPendingMessages.map((msg) => (
          <Grid item xs={12} sx={{ my: 1 }} key={msg.id}>
            <ChatMessageView text={msg.text} isAgentMessage={msg.isAgentMessage || false} />
          </Grid>
        ))}

        {showTypingIndicator && (
          <Grid item xs={12} sx={{ my: 1 }}>
            <TypingIndicator />
          </Grid>
        )}

        {error && <NoResponseAlert />}

        {showChatInputField && (
          <Grid item xs={12}>
            <Box mt={2} pb={1}>
              <ChatInputTextField
                inputMessage={followUpQuestion}
                onSendMessage={handleSendFollowUp}
                onInputMessageChange={setFollowUpQuestion}
                disabled={hasAtLeastOnePendingMessage(messages)}
              />
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

function NoResponseAlert() {
  const { t } = useTranslation('common');
  return (
    <Grid item xs={12}>
      <Alert severity={'info'} variant={'outlined'}>
        {t('feedback_agent_no_response')}
      </Alert>
    </Grid>
  );
}

function FeedbackSentSuccessAlert() {
  const { t } = useTranslation('common');

  const [open, setOpen] = useState(true);

  return (
    <Grid item xs={12}>
      {open && (
        <Alert severity="info" onClose={() => setOpen(false)} variant="outlined" sx={{ mt: 2, mb: 1 }} icon={<EmailIcon />}>
          <AlertTitle>{t('feedback_agent_sent_title')}</AlertTitle>
          {t('feedback_agent_sent_message')}
          <br />
          {t('feedback_agent_sent_patience')}
        </Alert>
      )}
    </Grid>
  );
}
