import React from "react";
import { Box, MenuItem, Typography, IconButton } from "@material-ui/core";
import EditIcon from '@material-ui/icons/Edit';
import {isStringEmpty} from "shared/Utils";
import SelectWatchable from "common/input/SelectWatchable";
import {CONSTANTS} from "shared/Constants";
import {SingleSelectionDialog} from "admin/messages/SingleSelectionDialog";
import {isArrayNotEmpty} from "shared/Utils";
import {useTranslation} from "react-i18next";
import {SmallTitle, Span} from "common/theme/typography/Tags";
import {
  START_EDIT_CUSTOM_SELECTED_RECIPIENTS,
  newAction,
  RECIPIENTS_SELECTION_CHANGE,
  useMessagesDispatch,
  useMessagesState,
  FINISH_EDIT_CUSTOM_SELECTED_RECIPIENTS
} from "admin/messages/MessagesContext";
import useTeamSelectionOptions from "shared/admin/messages/TeamSelectionOptionsHook";
import {useFormContext} from "react-hook-form";
import useRecipientName from "shared/admin/messages/RecipientNameHook";
import {MESSAGE_TYPE_PARTICIPANTS, MessageService} from "shared/admin/MessageService";
import useParticipantSelectionOptions from "shared/admin/messages/ParticipantSelectionOptionsHook";

function RecipientSelection() {

  const {t} = useTranslation('admin');
  const dispatch = useMessagesDispatch();
  const { setValue } = useFormContext();
  const {recipients, recipientSelection, customSelectedRecipients, showCustomSelectionDialog, messageType} = useMessagesState();

  const name = messageType === MESSAGE_TYPE_PARTICIPANTS ? "participantSelection" : "teamSelection";
  const label = messageType === MESSAGE_TYPE_PARTICIPANTS ? t("participant_selection_text") : t("admin:team_selection_text");

  React.useEffect(() => {
    setValue(name, recipientSelection);
  }, [recipientSelection, name, setValue]);

  const teamSelectionOptions = useTeamSelectionOptions();
  const participantSelectionOptions = useParticipantSelectionOptions();
  let recipientSelectionOptions = messageType === MESSAGE_TYPE_PARTICIPANTS ? participantSelectionOptions : teamSelectionOptions;
  recipientSelectionOptions = recipientSelectionOptions.map((selectionOption) =>
      <MenuItem value={selectionOption.value} key={selectionOption.value}>{selectionOption.label}</MenuItem>
  );

  const handleSelectionChange = newValue => dispatch(newAction(RECIPIENTS_SELECTION_CHANGE, newValue));
  const handleStartEditCustomSelectedRecipients = () => dispatch(newAction(START_EDIT_CUSTOM_SELECTED_RECIPIENTS));
  const handleFinishEditCustomSelectedRecipients = customSelectedEntities => dispatch(newAction(FINISH_EDIT_CUSTOM_SELECTED_RECIPIENTS, customSelectedEntities));

  const numberOfRecipients = MessageService.getNumberOfSelectedRecipients(recipients, recipientSelection);
  return (
      <Box mb={3} mt={2}>
        <SelectWatchable name={name}
                         label={label}
                         selectionOptions={recipientSelectionOptions}
                         onChange={handleSelectionChange} />
        <SelectionHelperText currentSelection={recipientSelection}
                             messageType={messageType}
                             customSelectedEntities={customSelectedRecipients}
                             numberOfSelectedRecipients={numberOfRecipients}
                             onEditCustomSelectedEntities={handleStartEditCustomSelectedRecipients} />
        { showCustomSelectionDialog && <SingleSelectionDialog open={showCustomSelectionDialog}
                                                              selectableEntities={recipients}
                                                              customSelectedEntities={customSelectedRecipients}
                                                              onClose={handleFinishEditCustomSelectedRecipients} /> }
      </Box>
  );
}

function SelectionHelperText({messageType, currentSelection, customSelectedEntities, onEditCustomSelectedEntities, numberOfSelectedRecipients}) {

  const {t} = useTranslation(['admin', 'common']);

  const {getRecipientName} = useRecipientName();

  if (isStringEmpty(currentSelection)) {
    return null;
  }

  if (isArrayNotEmpty(customSelectedEntities)) {
    const customSelectEntitiesList = customSelectedEntities.map(entity =>
        <SmallTitle key={entity.id}>{getRecipientName(entity)}</SmallTitle>
    );
    const label = messageType === MESSAGE_TYPE_PARTICIPANTS ? t('admin:participant_selection_single_selection_text') : t('admin:team_selection_single_selection_text');
    return (
        <>
          <Typography variant={"subtitle2"}>
            {label} <IconButton onClick={onEditCustomSelectedEntities} aria-label={t("common:change")}><EditIcon /></IconButton>
          </Typography>
          {customSelectEntitiesList}
        </>
    );
  }

  if (messageType === MESSAGE_TYPE_PARTICIPANTS) {
    if (currentSelection === CONSTANTS.PARTICIPANT_SELECTION.ASSIGNED_TO_TEAM) {
      return <Span html={true} i18n="admin:participant_selection_assigned_to_teams_text" parameters={{numberOfSelectedParticipants: numberOfSelectedRecipients}}/>;
    } else if (currentSelection === CONSTANTS.PARTICIPANT_SELECTION.NOT_ASSIGNED_TO_TEAM) {
      return <Span html={true} i18n="admin:participant_selection_not_assigned_to_teams_text" parameters={{numberOfSelectedParticipants: numberOfSelectedRecipients}}/>;
    } else {
      return <Span html={true} i18n="admin:participant_selection_all_text" parameters={{numberOfSelectedParticipants: numberOfSelectedRecipients}}/>;
    }
  } else {
    return <Span html={true} i18n="admin:team_selection_all_text" parameters={{numTeams: numberOfSelectedRecipients}}/>;
  }
}

export {
  RecipientSelection
};
