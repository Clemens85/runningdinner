import { Box, FormControl, InputLabel, LinearProgress, MenuItem, Select, Typography } from '@mui/material';
import {
  BackendIssue,
  getEffectiveSelectedRecipients,
  getMessageObjectSelector,
  getMessagePreviewSelector,
  getRecipientsPreviewSelector,
  getRecipientsSelector,
  isArrayEmpty,
  isArrayNotEmpty,
  MessageTypeAdminIdPayload,
  PreviewMessage,
  Recipient,
  updateRecipientForPreviewById,
  useAdminDispatch,
  useAdminSelector,
  useBackendIssueHandler,
  useRecipientName,
} from '@runningdinner/shared';
import { FetchStatus } from '@runningdinner/shared';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { TextViewHtml } from '../../common/TextViewHtml';
import { PaperGrey } from '../../common/theme/CommonStyles';
import { Span, Subtitle, Title } from '../../common/theme/typography/Tags';
import SendToMeButton from './SendToMeButton';
import { useCurrentRecipientSelectionValue } from './useCurrentRecipientSelectionValue';

export function MessagePreview({ adminId, messageType }: MessageTypeAdminIdPayload) {
  const { previewLoading, previewMessages, isMailMessageValid, previewIssues } = useAdminSelector(getMessagePreviewSelector);
  const messageObject = useAdminSelector(getMessageObjectSelector);
  const { recipients, selectedRecipientForPreview } = useAdminSelector(getRecipientsPreviewSelector);
  const { customSelectedRecipients } = useAdminSelector(getRecipientsSelector);

  const dispatch = useAdminDispatch();

  const { t } = useTranslation('admin');

  const currentRecipientSelectionValue = useCurrentRecipientSelectionValue(messageType);

  const recipientsForPreview = React.useMemo(() => {
    return getEffectiveSelectedRecipients(recipients.data || [], currentRecipientSelectionValue, customSelectedRecipients);
  }, [recipients.data, currentRecipientSelectionValue, customSelectedRecipients]);

  const handleSelectionChange = (newSelectedRecipientId: string) => dispatch(updateRecipientForPreviewById(newSelectedRecipientId));

  if (!isMailMessageValid) {
    return (
      <Box>
        <Box mb={2}>
          <Subtitle i18n="common:preview" />
        </Box>
        {isArrayNotEmpty(previewIssues) ? (
          <PreviewIssues previewIssues={previewIssues as BackendIssue[]} />
        ) : (
          <Typography variant={'subtitle1'}>{t('admin:messages_preview_empty')}</Typography>
        )}
      </Box>
    );
  }

  const previewMessageNodes = previewMessages.map((previewMessage: PreviewMessage, index: number) => (
    <Box mt={1} key={index}>
      <PaperGrey variant={'outlined'} square>
        <Box p={1} style={{ overflowX: 'scroll' }}>
          <Title>{messageObject.subject}</Title>
          <Span>
            <TextViewHtml text={previewMessage.message} />
          </Span>
        </Box>
      </PaperGrey>
    </Box>
  ));

  return (
    <Box>
      <Box mb={2}>
        <Subtitle i18n="common:preview" />
      </Box>

      <PreviewSelection recipients={recipientsForPreview} selectedRecipient={selectedRecipientForPreview} onSelectionChange={handleSelectionChange} />
      {(previewLoading || recipients.fetchStatus === FetchStatus.LOADING) && <LinearProgress color="secondary" />}
      {previewMessageNodes}

      <SendToMeButton adminId={adminId} messageObj={messageObject} selectedRecipient={selectedRecipientForPreview} messageType={messageType} />
    </Box>
  );
}

interface PreviewSelectionProps {
  recipients: Recipient[];
  selectedRecipient?: Recipient;
  onSelectionChange: (newSelectedRecipientId: string) => unknown;
}
function PreviewSelection({ recipients, selectedRecipient, onSelectionChange }: PreviewSelectionProps) {
  const { t } = useTranslation(['admin']);
  const { getRecipientName } = useRecipientName();

  function handleChange(changeEvent: React.ChangeEvent<{ value: unknown }>) {
    const newSelectedRecipientId = changeEvent.target.value as string;
    onSelectionChange(newSelectedRecipientId);
  }

  if (isArrayEmpty(recipients)) {
    return null;
  }
  const selectionOptions = recipients.map((recipient) => (
    <MenuItem value={recipient.id} key={recipient.id}>
      {getRecipientName(recipient)}
    </MenuItem>
  ));

  const selectedValue = selectedRecipient ? selectedRecipient.id : '';

  const selectionLabel = t('admin:messages_preview_selection');
  return (
    <FormControl variant="outlined" fullWidth>
      <InputLabel>{selectionLabel}</InputLabel>
      <Select
        variant="outlined"
        label={selectionLabel}
        autoWidth
        value={selectedValue}
        // @ts-ignore
        onChange={handleChange}
        inputProps={{ 'aria-label': selectionLabel }}
      >
        {selectionOptions}
      </Select>
    </FormControl>
  );
}

interface PreviewIssuesProps {
  previewIssues: BackendIssue[];
}
function PreviewIssues({ previewIssues }: PreviewIssuesProps) {
  const { getIssuesArrayTranslated } = useBackendIssueHandler({
    defaultTranslationResolutionSettings: {
      namespaces: ['admin', 'common'],
    },
  });

  const firstIssueTranslatedWrapper = getIssuesArrayTranslated(previewIssues);
  const firstIssue = isArrayNotEmpty(firstIssueTranslatedWrapper.issuesFieldRelated)
    ? firstIssueTranslatedWrapper.issuesFieldRelated[0]
    : firstIssueTranslatedWrapper.issuesWithoutField[0];

  return (
    <>
      <Typography variant={'subtitle1'} color={'error'}>
        {firstIssue?.error?.message}
      </Typography>
    </>
  );
}
