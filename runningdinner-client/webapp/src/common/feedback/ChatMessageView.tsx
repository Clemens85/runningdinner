import { Box, Paper, Stack } from '@mui/material';
import Markdown from 'markdown-to-jsx';

type ChatMessageProps = {
  text: string;
  isAgentMessage?: boolean;
};

export function ChatMessageView({ text, isAgentMessage }: ChatMessageProps) {
  const bgColor = isAgentMessage ? 'primary.main' : 'grey.200';
  const color = isAgentMessage ? 'primary.contrastText' : 'text.primary';

  const justifyContent = isAgentMessage ? 'flex-end' : 'flex-start';

  return (
    <Stack direction="row" sx={{ justifyContent: justifyContent }}>
      <Box sx={{ maxWidth: '90%' }}>
        <Paper
          elevation={1}
          sx={{
            p: 2,
            backgroundColor: bgColor,
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
          <Box
            sx={{
              '& *': { color: 'inherit' },
              '& p': { margin: '0 0 8px 0', '&:last-child': { marginBottom: 0 } },
              '& h1, & h2': { fontSize: '1.2rem', fontWeight: 600, margin: '8px 0 4px' },
              '& h3, & h4': { fontSize: '1rem', fontWeight: 600, margin: '6px 0 4px' },
              '& ul, & ol': { paddingLeft: '1.5em', margin: '0 0 8px' },
              '& li': { marginBottom: '2px' },
              '& code': {
                fontFamily: 'monospace',
                fontSize: '0.875em',
                backgroundColor: 'rgba(0,0,0,0.12)',
                padding: '1px 4px',
                borderRadius: '3px',
              },
              '& pre': {
                backgroundColor: 'rgba(0,0,0,0.15)',
                padding: '8px 12px',
                borderRadius: '4px',
                overflow: 'auto',
                margin: '8px 0',
              },
              '& pre code': { backgroundColor: 'transparent', padding: 0 },
              '& a': { color: 'inherit', textDecorationColor: 'inherit' },
              '& blockquote': {
                borderLeft: '3px solid currentColor',
                margin: '8px 0',
                paddingLeft: '12px',
                opacity: 0.8,
              },
            }}
          >
            <Markdown
              options={{
                overrides: {
                  h1: { component: 'h2' },
                  h5: { component: 'h4' },
                  h6: { component: 'h4' },
                },
              }}
            >
              {text}
            </Markdown>
          </Box>
        </Paper>
      </Box>
    </Stack>
  );
}
