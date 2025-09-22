import { Paper, Typography, Box, Stack } from '@mui/material';

type ChatMessageProps = {
  text: string;
  isAgentMessage?: boolean;
};

export function ChatMessage({ text, isAgentMessage }: ChatMessageProps) {
  const bgColor = isAgentMessage ? 'primary.main' : 'grey.200';
  const color = isAgentMessage ? 'primary.contrastText' : 'text.primary';

  // const bgColor = isAgentMessage ? 'info.main' : 'grey.200';
  // const color = isAgentMessage ? 'info.contrastText' : 'text.primary';

  // const textAlign = isAgentMessage ? 'right' : 'left';
  const justifyContent = isAgentMessage ? 'flex-end' : 'flex-start';
  // Split the text by newlines and wrap each part in a Typography component
  const textParts = text.split('\n');

  return (
    <Stack direction="row" justifyContent={justifyContent}>
      <Box maxWidth="90%">
        <Paper
          elevation={1}
          sx={{
            p: 2,
            backgroundColor: bgColor,
            // textAlign: textAlign,
            color: color,
            borderRadius: 2,
            opacity: 1,
            animation: 'fadeIn 0.5s ease-in',
            '@keyframes fadeIn': {
              '0%': { opacity: 0, transform: 'translateY(10px)' },
              '100%': { opacity: 1, transform: 'translateY(0)' },
            },
          }}
        >
          <Box>
            {textParts.map((part, index) => (
              <Typography
                key={index}
                variant="body1"
                component={index < textParts.length - 1 ? 'div' : 'p'}
                sx={{
                  minHeight: part === '' ? '1em' : 'auto',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {part}
              </Typography>
            ))}
          </Box>
        </Paper>
      </Box>
    </Stack>
  );
}
