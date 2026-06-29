import CloseIcon from '@mui/icons-material/Close';
import DirectionsIcon from '@mui/icons-material/Directions';
import EmailIcon from '@mui/icons-material/Email';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import { Alert, Avatar, Box, Card, CardContent, Divider, Drawer, IconButton, List, ListItemAvatar, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';
import { formatLocalDate, formatLocalDateWithSeconds, PortalMessage, PortalMessageType } from '@runningdinner/shared';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FetchProgressBar } from '../../common/FetchProgressBar.tsx';
import { TextViewHtml } from '../../common/TextViewHtml.tsx';

function getMessageSnippet(htmlContent: string): string {
  return htmlContent
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// Message type avatar
// ---------------------------------------------------------------------------

function MessageAvatar({ type }: { type: PortalMessageType }) {
  const iconSx = { fontSize: 18 };
  if (type === 'TEAM') {
    return (
      <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
        <GroupIcon sx={iconSx} />
      </Avatar>
    );
  }
  if (type === 'DINNER_ROUTE') {
    return (
      <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36 }}>
        <DirectionsIcon sx={iconSx} />
      </Avatar>
    );
  }
  // PARTICIPANT
  return (
    <Avatar sx={{ bgcolor: 'text.disabled', width: 36, height: 36 }}>
      <PersonIcon sx={iconSx} />
    </Avatar>
  );
}

// ---------------------------------------------------------------------------
// Message detail drawer
// ---------------------------------------------------------------------------

interface MessageDetailDrawerProps {
  message: PortalMessage | null;
  onClose: () => void;
}

function MessageDetailDrawer({ message, onClose }: MessageDetailDrawerProps) {
  const { t } = useTranslation('portal');

  return (
    <Drawer anchor="right" open={!!message} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 600, md: 720 }, maxWidth: '100%', p: 0 } }}>
      {message && (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Top bar: subject + close */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              borderBottom: '1px solid',
              borderColor: 'divider',
              gap: 1,
              minWidth: 0,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                lineHeight: 1.3,
                fontSize: '1rem',
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {message.subject}
            </Typography>
            <IconButton size="small" onClick={onClose} aria-label={t('participant_event_message_view_close')} sx={{ flexShrink: 0, mt: 0.25 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Email meta header */}
          <Box sx={{ px: 2, py: 1.5, bgcolor: 'action.hover' }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <MessageAvatar type={message.messageType} />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                  {t('participant_event_message_organizer')}
                  {message.replyTo ? ` <${message.replyTo}>` : ''}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('participant_event_message_sent_on')}: {formatLocalDateWithSeconds(message.sentDateTime)}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Divider />

          {/* Body */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
            <TextViewHtml text={message.content} />
          </Box>
        </Box>
      )}
    </Drawer>
  );
}

// ---------------------------------------------------------------------------
// Messages list
// ---------------------------------------------------------------------------

interface MessageListProps {
  messages: PortalMessage[];
  onSelect: (message: PortalMessage) => void;
}

function MessageList({ messages, onSelect }: MessageListProps) {
  return (
    <List disablePadding>
      {messages.map((msg, idx) => (
        <Box key={idx}>
          {idx > 0 && <Divider component="li" />}
          <ListItemButton onClick={() => onSelect(msg)} sx={{ px: 1, py: 0.75, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}>
            <ListItemAvatar sx={{ minWidth: 48 }}>
              <MessageAvatar type={msg.messageType} />
            </ListItemAvatar>
            <ListItemText
              sx={{ minWidth: 0, overflow: 'hidden' }}
              primary={
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }} noWrap>
                  {msg.subject}
                </Typography>
              }
              secondary={
                <Typography variant="caption" color="text.secondary" noWrap>
                  {getMessageSnippet(msg.content)}
                </Typography>
              }
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1, flexShrink: 0, whiteSpace: 'nowrap' }}>
              {formatLocalDate(msg.sentDateTime)}
            </Typography>
          </ListItemButton>
        </Box>
      ))}
    </List>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export interface MessagesSectionProps {
  messages: PortalMessage[] | undefined;
  isLoading: boolean;
}

export function MessagesSection({ messages, isLoading }: MessagesSectionProps) {
  const { t } = useTranslation('portal');
  const [selectedMessage, setSelectedMessage] = useState<PortalMessage | null>(null);

  if (isLoading) {
    return <FetchProgressBar isPending={isLoading} error={undefined} />;
  }

  const hasMessages = messages && messages.length > 0;

  return (
    <>
      <Card variant="outlined">
        <CardContent>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <EmailIcon color="primary" />
            <Typography variant="h6">{t('participant_event_section_messages')}</Typography>
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('participant_event_messages_intro')}
          </Typography>

          {!hasMessages && (
            <Alert severity="info" icon={false}>
              {t('participant_event_messages_empty')}
            </Alert>
          )}

          {hasMessages && (
            <>
              <Divider sx={{ mb: 0.5 }} />
              <MessageList messages={messages} onSelect={setSelectedMessage} />
            </>
          )}
        </CardContent>
      </Card>

      <MessageDetailDrawer message={selectedMessage} onClose={() => setSelectedMessage(null)} />
    </>
  );
}
