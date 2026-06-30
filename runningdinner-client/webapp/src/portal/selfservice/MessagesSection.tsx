import CloseIcon from '@mui/icons-material/Close';
import DirectionsIcon from '@mui/icons-material/Directions';
import EmailIcon from '@mui/icons-material/Email';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import { Alert, Avatar, Badge, Box, Card, CardContent, Divider, Drawer, IconButton, List, ListItemAvatar, ListItemButton, ListItemText, Stack, Typography } from '@mui/material';
import { formatLocalDate, formatLocalDateWithSeconds, markMessageAsRead, PortalCredential, PortalMessage, PortalMessageType } from '@runningdinner/shared';
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

function MessageAvatar({ type, unread = false }: { type: PortalMessageType; unread?: boolean }) {
  const iconSize = 36;
  const iconSx = { fontSize: 18 };

  const avatar =
    type === 'TEAM' ? (
      <Avatar sx={{ bgcolor: 'primary.main', width: iconSize, height: iconSize }}>
        <GroupIcon sx={iconSx} />
      </Avatar>
    ) : type === 'DINNER_ROUTE' ? (
      <Avatar sx={{ bgcolor: 'secondary.main', width: iconSize, height: iconSize }}>
        <DirectionsIcon sx={iconSx} />
      </Avatar>
    ) : (
      <Avatar sx={{ bgcolor: 'text.disabled', width: iconSize, height: iconSize }}>
        <PersonIcon sx={iconSx} />
      </Avatar>
    );

  if (!unread) {
    return avatar;
  }
  return (
    <Badge overlap="circular" anchorOrigin={{ vertical: 'top', horizontal: 'right' }} variant="dot" color="primary">
      {avatar}
    </Badge>
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
    <Drawer anchor="right" open={!!message} onClose={onClose} slotProps={{ paper: { sx: { width: { xs: '100%', sm: 600, md: 720 }, maxWidth: '100%', p: 0 } } }}>
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
  locallyReadIds: Set<string>;
}

function MessageList({ messages, onSelect, locallyReadIds }: MessageListProps) {
  return (
    <List disablePadding>
      {messages.map((msg, idx) => {
        const unread = !msg.read && !locallyReadIds.has(msg.messageTaskId);
        return (
          <Box key={idx}>
            {idx > 0 && <Divider component="li" />}
            <ListItemButton
              onClick={() => {
                (document.activeElement as HTMLElement)?.blur();
                onSelect(msg);
              }}
              sx={{ px: 1, py: 0.75, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' }, bgcolor: unread ? 'action.selected' : undefined }}
            >
              <ListItemAvatar sx={{ minWidth: 48 }}>
                <MessageAvatar type={msg.messageType} unread={unread} />
              </ListItemAvatar>
              <ListItemText
                sx={{ minWidth: 0, overflow: 'hidden' }}
                primary={
                  <Typography variant="body2" sx={{ fontWeight: unread ? 700 : 500, color: 'text.primary' }} noWrap>
                    {msg.subject}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {getMessageSnippet(msg.content)}
                  </Typography>
                }
              />
              <Typography variant="caption" color={unread ? 'primary.main' : 'text.secondary'} sx={{ ml: 1, flexShrink: 0, whiteSpace: 'nowrap', fontWeight: unread ? 700 : 400 }}>
                {formatLocalDate(msg.sentDateTime)}
              </Typography>
            </ListItemButton>
          </Box>
        );
      })}
    </List>
  );
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------

export interface MessagesSectionProps {
  messages: PortalMessage[] | undefined;
  isLoading: boolean;
  credential: PortalCredential;
}

export function MessagesSection({ messages, isLoading, credential }: MessagesSectionProps) {
  const { t } = useTranslation('portal');
  const [selectedMessage, setSelectedMessage] = useState<PortalMessage | null>(null);
  const [locallyReadIds, setLocallyReadIds] = useState<Set<string>>(new Set());

  const handleSelect = (msg: PortalMessage) => {
    setSelectedMessage(msg);
    if (!msg.read && !locallyReadIds.has(msg.messageTaskId)) {
      setLocallyReadIds((prev) => new Set(prev).add(msg.messageTaskId));
      // Fire-and-forget: errors are intentionally ignored
      markMessageAsRead(msg.messageTaskId, credential).catch(() => {});
    }
  };

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
              <MessageList messages={messages} onSelect={handleSelect} locallyReadIds={locallyReadIds} />
            </>
          )}
        </CardContent>
      </Card>

      <MessageDetailDrawer message={selectedMessage} onClose={() => setSelectedMessage(null)} />
    </>
  );
}
