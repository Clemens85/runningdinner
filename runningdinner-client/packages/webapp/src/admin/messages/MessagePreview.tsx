import React from "react";
import {PaperGrey} from "../../common/theme/PaperGrey";
import {Box, FormControl, InputLabel, LinearProgress, MenuItem, Select, Typography} from "@material-ui/core";
import parse from 'html-react-parser';
import SendToMeButton from "./SendToMeButton";
import {Span, Subtitle, Title} from "../../common/theme/typography/Tags";
import {
  getMessageObjectSelector,
  getMessagePreviewSelector,
  getRecipientsPreviewSelector,
  isArrayEmpty,
  MessageTypeAdminIdPayload,
  PreviewMessage,
  Recipient,
  updateRecipientForPreviewById,
  useAdminSelector,
  useRecipientName
} from "@runningdinner/shared";
import {useDispatch} from "react-redux";
import {FetchStatus} from "@runningdinner/shared/src/redux";

export function MessagePreview({adminId, messageType}: MessageTypeAdminIdPayload) {

  const {previewLoading, previewMessages, isMailMessageValid} = useAdminSelector(getMessagePreviewSelector);
  const messageObject = useAdminSelector(getMessageObjectSelector);
  const {recipients, selectedRecipientForPreview} = useAdminSelector(getRecipientsPreviewSelector);

  const dispatch = useDispatch();

  const handleSelectionChange = (newSelectedRecipientId: string) => dispatch(updateRecipientForPreviewById(newSelectedRecipientId));

  if (!isMailMessageValid) {
    return (
        <Box>
          <Box mb={2}>
            <Subtitle i18n="common:preview" />
          </Box>
          <Typography variant={"subtitle1"}>Um die Vorschau zu sehen, muss Betreff und Nachricht ausgefüllt sein.</Typography>
        </Box>
    );
  }

  const previewMessageNodes = previewMessages.map((previewMessage: PreviewMessage, index: number) =>
      <Box mt={1} key={index}>
        <PaperGrey variant={"outlined"} square>
          <Box p={1} style={{overflowX: 'scroll'}}>
            <Title>{messageObject.subject}</Title>
            <Span>{parse(previewMessage.message)}</Span>
          </Box>
        </PaperGrey>
      </Box>);

  return (
      <Box>
        <Box mb={2}>
          <Subtitle i18n="common:preview" />
        </Box>

        { recipients.data && <PreviewSelection recipients={recipients.data} selectedRecipient={selectedRecipientForPreview} onSelectionChange={handleSelectionChange}/> }
        { (previewLoading || recipients.fetchStatus === FetchStatus.LOADING) && <LinearProgress color="secondary" /> }
        { previewMessageNodes }

        <SendToMeButton adminId={adminId}
                        messageObj={messageObject}
                        selectedRecipient={selectedRecipientForPreview}
                        messageType={messageType} />
      </Box>

  );
}

interface PreviewSelectionProps {
  recipients: Recipient[];
  selectedRecipient?: Recipient;
  onSelectionChange: (newSelectedRecipientId: string) => unknown;
}
function PreviewSelection({recipients, selectedRecipient, onSelectionChange}: PreviewSelectionProps) {

  const {getRecipientName} = useRecipientName();

  function handleChange(changeEvent: React.ChangeEvent<{ value: unknown}>) {
    const newSelectedRecipientId = changeEvent.target.value as string;
    onSelectionChange(newSelectedRecipientId);
  }

  if (isArrayEmpty(recipients)) {
    return null;
  }
  const selectionOptions = recipients
      .map(recipient =>
          <MenuItem value={recipient.id} key={recipient.id}>
            {getRecipientName(recipient)}
          </MenuItem>
      );

  const selectedValue = selectedRecipient ? selectedRecipient.id : '';

  const selectionLabel = 'Auswahl für Vorschau';
  return (
      <FormControl fullWidth>
        <InputLabel>{selectionLabel}</InputLabel>
        <Select
            autoWidth
            value={selectedValue}
            onChange={handleChange}
            inputProps={{ 'aria-label': selectionLabel }}>
          {selectionOptions}
        </Select>
      </FormControl>
  )
}
