import { IconButton, Paper, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { CallbackHandler } from '@runningdinner/shared';

export type ChatInputMessageProps = {
  inputMessage: string;
  onInputMessageChange: (inputMessage: string) => void;
  onSendMessage: CallbackHandler;
  disabled?: boolean;
};

export function ChatInputTextField({ inputMessage, onInputMessageChange, onSendMessage, disabled }: ChatInputMessageProps) {
  function handleSubmitMessage() {
    if (!disabled) {
      onSendMessage();
    }
  }

  // Handle Enter key press
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmitMessage();
    }
  };

  return (
    <Paper
      elevation={1}
      sx={{
        p: 1,
        display: 'flex',
        alignItems: 'flex-end',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        '&:focus-within': {
          borderColor: 'primary.main',
        },
      }}
    >
      <TextField
        autoFocus={true}
        variant="standard"
        name="followUpQuestion"
        fullWidth
        multiline
        maxRows={20}
        value={inputMessage}
        onChange={(e) => onInputMessageChange(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder={'Weitere Fragen oder Anmerkungen?'}
        InputProps={{
          disableUnderline: true,
        }}
        sx={{
          ml: 1,
          flex: 1,
          '& .MuiInputBase-root': {
            padding: '8px 0',
          },
        }}
      />
      <IconButton
        color="primary"
        onClick={handleSubmitMessage}
        disabled={disabled}
        sx={{
          ml: 1,
          alignSelf: 'flex-end',
          mb: '6px',
          backgroundColor: !disabled ? 'primary.main' : 'action.disabledBackground',
          color: !disabled ? 'white' : 'action.disabled',
          '&:hover': {
            backgroundColor: !disabled ? 'primary.dark' : 'action.disabledBackground',
          },
          width: '32px',
          height: '32px',
        }}
        size="small"
      >
        <SendIcon fontSize="small" />
      </IconButton>
    </Paper>
  );
}
