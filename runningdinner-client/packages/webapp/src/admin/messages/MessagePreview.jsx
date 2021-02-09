import React from "react";
import {PaperGrey} from "../../common/theme/PaperGrey";
import { Box, FormControl, Typography, InputLabel, Select, MenuItem, LinearProgress } from "@material-ui/core";
import parse from 'html-react-parser';
import SendToMeButton from "./SendToMeButton";
import {Span, Subtitle, Title} from "../../common/theme/typography/Tags";
import {isArrayEmpty, useRecipientName} from "@runningdinner/shared";
import {CHANGE_PREVIEW_RECIPIENT, newAction, useMessagesDispatch, useMessagesState} from "./MessagesContext";

const MessagePreview = ({adminId}) => {

  const {previewLoading, previewMessages, subject, recipients, selectedRecipientForPreview, isMailMessageValid, messageObject, messageType} = useMessagesState();
  const dispatch = useMessagesDispatch();

  const handleSelectionChange = newSelectedRecipientId => dispatch(newAction(CHANGE_PREVIEW_RECIPIENT, newSelectedRecipientId));

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


  const previewMessageNodes = previewMessages.map((previewMessage, index) =>
      <Box mt={1} key={index}>
        <PaperGrey variant={"outlined"} square>
          <Box p={1} style={{overflowX: 'scroll'}}>
            <Title>{subject}</Title>
            <Span>{parse(previewMessage.message)}</Span>
          </Box>
        </PaperGrey>
      </Box>);

  return (
      <Box>
        <Box mb={2}>
          <Subtitle i18n="common:preview" />
        </Box>

        <PreviewSelection recipients={recipients} selectedRecipient={selectedRecipientForPreview} onSelectionChange={handleSelectionChange}/>
        { previewLoading && <LinearProgress color="secondary" /> }
        { previewMessageNodes }

        <SendToMeButton adminId={adminId} messageObj={messageObject} selectedRecipient={selectedRecipientForPreview} messageType={messageType} />

      </Box>

  );
};

function PreviewSelection({recipients, selectedRecipient, onSelectionChange}) {

  const {getRecipientName} = useRecipientName();

  function handleChange(changeEvent) {
    const newSelectedRecipientId = changeEvent.target.value;
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

export {
  MessagePreview
};
