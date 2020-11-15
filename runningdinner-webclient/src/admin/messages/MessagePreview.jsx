import React, {useEffect, useState} from "react";
import {PaperGrey} from "../../common/theme/PaperGrey";
import { Box, FormControl, Typography, InputLabel, Select, MenuItem, LinearProgress } from "@material-ui/core";
import ParticipantService from "../../shared/admin/ParticipantService";
import {findEntityById, isStringEmpty} from "../../shared/Utils";
import MessageService from "../../shared/admin/MessageService";
import parse from 'html-react-parser';
import SendToMeButton from "./SendToMeButton";

const MessagePreview = ({adminId, participants, messageObj}) => {

  console.log('Rendering MessagePreview');

  const [selectedParticipant, setSelectedParticipant] = useState(participants ? participants[0] : null);
  const [previewMessage, setPreviewMessage] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    setPreviewMessage(messageObj.message);
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    updatePreviewMessage(messageObj.subject, messageObj.message);
    // eslint-disable-next-line
  }, [messageObj.message, messageObj.subject, selectedParticipant]);


  function handleSelectionChange(id) {
    const foundParticipant = findEntityById(participants, id);
    setSelectedParticipant(foundParticipant);
  }

  function updatePreviewMessage(updatedMessageSubject, updatedMessageText) {
    if (!isMailMessageValid(updatedMessageSubject, updatedMessageText)) {
      return;
    }

    setPreviewLoading(true);
    const participantMailMessage = {
      subject: updatedMessageSubject,
      message: updatedMessageText
    };
    MessageService
        .getParticipantMailPreviewAsync(adminId, participantMailMessage, selectedParticipant)
        .then(response => {
          const previewObj = response.previewMessageList[0];
          setPreviewMessage(previewObj.message);
        })
        .finally(() => setPreviewLoading(false));
  }

  function isMailMessageValid(subject, message) {
    return selectedParticipant && !isStringEmpty(subject) && !isStringEmpty(message);
  }

  if (!isMailMessageValid(messageObj.subject, messageObj.message)) {
    return (
        <Box>
          <Box mb={2}>
            <Typography variant={"h5"}>Vorschau</Typography>
          </Box>
          <Typography variant={"subtitle1"}>Um die Vorschau zu sehen, muss Betreff und Nachricht ausgefüllt sein.</Typography>
        </Box>
    );
  }

  return (
    <Box>
      <Box mb={2}>
        <Typography variant={"h5"}>Vorschau</Typography>
      </Box>

      <PreviewSelection participants={participants} selectedParticipant={selectedParticipant} onSelectionChange={handleSelectionChange}/>

      <Box mt={1}>
        <PaperGrey variant={"outlined"} square>
          <Box p={1} style={{overflowX: 'scroll'}}>
            <Typography variant={"h6"}>{messageObj.subject}</Typography>
            <Typography variant={"body2"}>
              {parse(previewMessage)}
            </Typography>
          </Box>
          { previewLoading && <LinearProgress color="secondary" /> }
        </PaperGrey>
      </Box>

      <SendToMeButton adminId={adminId} messageObj={messageObj} selectedParticipant={selectedParticipant} />

    </Box>

  );
};

function PreviewSelection({participants, selectedParticipant, onSelectionChange}) {

  function handleChange(changeEvent) {
    const selectedParticipantId = changeEvent.target.value;
    onSelectionChange(selectedParticipantId);
  }

  if (!participants || participants.length === 0) {
    return null;
  }

  const selectionOptions = participants
      .map(participant => <MenuItem value={participant.id} key={participant.id}>{ParticipantService.getFullname(participant)}</MenuItem>);

  const selectedValue = selectedParticipant ? selectedParticipant.id : '';

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

export default MessagePreview;
