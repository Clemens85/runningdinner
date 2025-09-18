import { Paper, Typography } from '@mui/material';

type ChatMessageProps = {
  text: string;
  isAgentMessage?: boolean;
};

export function ChatMessage({ text, isAgentMessage }: ChatMessageProps) {
  const bgColor = isAgentMessage ? 'primary.light' : 'grey.200';
  const color = isAgentMessage ? 'primary.contrastText' : 'text.primary';
  const textAlign = isAgentMessage ? 'right' : 'left';

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        bgcolor: bgColor,
        textAlign: textAlign,
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
      <Typography variant="body1">{text}</Typography>
    </Paper>
  );
}
