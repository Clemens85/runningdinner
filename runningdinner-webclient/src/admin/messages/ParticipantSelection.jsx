import React, {useEffect, useState} from "react";
import MessageService, {ParticipantSelectionChoices} from "../../shared/admin/MessageService";
import { Box, MenuItem, Typography, IconButton } from "@material-ui/core";
import EditIcon from '@material-ui/icons/Edit';
import {isStringEmpty} from "../../shared/Utils";
import {useFormContext} from "react-hook-form";
import SelectWatchable from "../../common/input/SelectWatchable";
import {CONSTANTS} from "../../shared/Constants";
import {SingleSelectionDialog} from "./SingleSelectionDialog";
import Fullname from "../../shared/Fullname";

export default function ParticipantSelection({participants, customSelectedEntities, onCustomSelectedEntitiesChange}) {

  const [openSingleSelectionDialog, setOpenSingleSelectionDialog] = useState(false);

  const { setValue, getValues } = useFormContext();

  const selectionOptions = ParticipantSelectionChoices.map((selectionOption) =>
      <MenuItem value={selectionOption.value} key={selectionOption.value}>{selectionOption.label}</MenuItem>
  );

  const handleParticipantSelectionChange = newValue => {
    setSelectionValues({
      current: newValue,
      prev: selectionValues.current
    });
    if (newValue === CONSTANTS.PARTICIPANT_SELECTION.CUSTOM_SELECTION) {
      setOpenSingleSelectionDialog(true);
    } else {
      onCustomSelectedEntitiesChange([]);
    }
  };

  const handleSingleSelectionDialogClose = (customSelectedEntities) => {
    setOpenSingleSelectionDialog(false);
    if (!customSelectedEntities || customSelectedEntities.length <= 0) {
      setValue("participantSelection", selectionValues.prev);
    }
    onCustomSelectedEntitiesChange(customSelectedEntities);
  };

  const [selectionValues, setSelectionValues] = useState({
    current: null,
    prev: null
  });

  useEffect(() => {
    const participantSelectionValue = getValues("participantSelection");
    setSelectionValues({
      current: participantSelectionValue,
      prev: null
    });
  }, [getValues]);

  return (
      <Box mb={3} mt={2}>
        <SelectWatchable name="participantSelection" label="Teilnehmer für Mailversand auswählen" selectionOptions={selectionOptions} onChange={handleParticipantSelectionChange} />
        <ParticipantSelectionHelperText participants={participants}
                                        participantSelection={selectionValues.current}
                                        customSelectedEntities={customSelectedEntities}
                                        onEditCustomSelectedEntities={() => setOpenSingleSelectionDialog(true)} />
        <SingleSelectionDialog open={openSingleSelectionDialog} selectableEntities={participants} customSelectedEntities={customSelectedEntities} onClose={handleSingleSelectionDialogClose} />
      </Box>
  );
}

function ParticipantSelectionHelperText({participants, participantSelection, customSelectedEntities, onEditCustomSelectedEntities}) {

  const numberOfSelectedParticipants = MessageService.getNumberOfSelectedParticipants(participants, participantSelection);

  if (isStringEmpty(participantSelection)) {
    return null;
  }

  if (participantSelection === CONSTANTS.PARTICIPANT_SELECTION.CUSTOM_SELECTION && customSelectedEntities && customSelectedEntities.length > 0) {

    const customSelectEntitiesList = customSelectedEntities.map(entity =>
        <Typography variant={"body2"} key={entity.id} component="div"><Fullname {...entity } /></Typography>
    );
    return (
      <>
        <Typography variant={"subtitle2"}>
          Ausgewählte Teilnehmer <IconButton onClick={onEditCustomSelectedEntities} aria-label="Ändern"><EditIcon /></IconButton>
        </Typography>
        {customSelectEntitiesList}
      </>
    );
  }

  return (
    <Typography variant={"body2"}>Alle {numberOfSelectedParticipants} Teilnehmer ausgewählt</Typography>
  );
}
