import React from "react";
import {Box, IconButton, LinearProgress, MenuItem, Typography} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import FormSelect from "../../common/input/FormSelect";
import {SingleSelectionDialog} from "./SingleSelectionDialog";
import {
  CallbackHandler,
  CONSTANTS,
  findEntityById,
  getEffectiveSelectedRecipients,
  getRecipientsPreviewSelector,
  isArrayEmpty,
  isArrayNotEmpty,
  isStringEmpty,
  MessageType,
  Recipient, setCustomSelectedRecipients, setPreviousRecipientSelection,
  updateRecipientForPreviewById,
  useAdminDispatch,
  useAdminSelector,
  useParticipantSelectionOptions,
  useRecipientName,
  useTeamSelectionOptions
} from "@runningdinner/shared";
import {useTranslation} from "react-i18next";
import {SmallTitle, Span} from "../../common/theme/typography/Tags";
import {useFormContext} from "react-hook-form";
import {
  finishEditCustomSelectedRecipients,
  getRecipientsSelector,
  MessageTypeAdminIdPayload,
  startEditCustomSelectedRecipients,
} from "@runningdinner/shared";
import {FetchStatus} from "@runningdinner/shared";
import { useCurrentRecipientSelectionValue } from "./useCurrentRecipientSelectionValue";

function RecipientSelection({messageType}: MessageTypeAdminIdPayload) {

  const {t} = useTranslation('admin');
  const dispatch = useAdminDispatch();
  const { setValue } = useFormContext();
  const {recipients, previousRecipientSelection, customSelectedRecipients, showCustomSelectionDialog} = useAdminSelector(getRecipientsSelector);
  const {selectedRecipientForPreview} = useAdminSelector(getRecipientsPreviewSelector);

  const teamSelectionOptions = useTeamSelectionOptions();
  const participantSelectionOptions = useParticipantSelectionOptions();

  const name = messageType === MessageType.MESSAGE_TYPE_PARTICIPANTS ? "participantSelection" : "teamSelection";
  const label = messageType === MessageType.MESSAGE_TYPE_PARTICIPANTS ? t("participant_selection_text") : t("admin:team_selection_text");

  const currentRecipientSelectionValue = useCurrentRecipientSelectionValue(messageType);

  const effectiveSelectedRecipients = React.useMemo(
    () => {
      return getEffectiveSelectedRecipients(recipients.data || [], currentRecipientSelectionValue, customSelectedRecipients);
    },
    [recipients.data, currentRecipientSelectionValue, customSelectedRecipients]
  );
  const numberOfRecipients = effectiveSelectedRecipients.length;

  if (recipients.fetchStatus !== FetchStatus.SUCCEEDED) {
    return <LinearProgress variant={"indeterminate"} />;
  }

  function changeRecipientForPreviewIfNeeded(updatedSelectedRecipients: Recipient[]) {
    if (updatedSelectedRecipients.length > 0) {
      if (!findEntityById(updatedSelectedRecipients, selectedRecipientForPreview?.id)) {
        dispatch(updateRecipientForPreviewById(updatedSelectedRecipients[0].id!));
      }
    }
  }

  function handleRecipientSelectionChange(event: React.ChangeEvent<{ value: unknown }>) {
    const newRecipientSelection = event.target.value as string;
    if (newRecipientSelection === CONSTANTS.RECIPIENT_SELECTION_COMMON.CUSTOM_SELECTION) {
      dispatch(startEditCustomSelectedRecipients());
    } else {
      dispatch(setCustomSelectedRecipients([]));
      dispatch(setPreviousRecipientSelection(newRecipientSelection));
      setValue(name, newRecipientSelection);
      const updatedSelectedRecipients = getEffectiveSelectedRecipients(recipients.data || [], newRecipientSelection, customSelectedRecipients);
      changeRecipientForPreviewIfNeeded(updatedSelectedRecipients);
    }
  }

  const handleStartEditCustomSelectedRecipients = () => dispatch(startEditCustomSelectedRecipients());

  const handleFinishEditCustomSelectedRecipients = (updatedCustomSelectedRecipients: Recipient[]) => {
    dispatch(finishEditCustomSelectedRecipients(updatedCustomSelectedRecipients));
    if (isArrayEmpty(updatedCustomSelectedRecipients)) {
      setValue(name, previousRecipientSelection);
    } else {
      setValue(name, CONSTANTS.RECIPIENT_SELECTION_COMMON.CUSTOM_SELECTION);
      const updatedSelectedRecipients = getEffectiveSelectedRecipients(recipients.data || [], CONSTANTS.RECIPIENT_SELECTION_COMMON.CUSTOM_SELECTION, updatedCustomSelectedRecipients);
      changeRecipientForPreviewIfNeeded(updatedSelectedRecipients);
    }
  }

  const recipientSelectionOptions = messageType === MessageType.MESSAGE_TYPE_PARTICIPANTS ? participantSelectionOptions : teamSelectionOptions;

  return (
      <Box mb={3} mt={2}>
        <FormSelect name={name}
                    onChange={handleRecipientSelectionChange}
                    label={label}
                    variant={"outlined"}
                    displayEmpty
                    fullWidth>
          { recipientSelectionOptions.map((selectionOption) =>
              <MenuItem value={selectionOption.value} key={selectionOption.value}>{selectionOption.label}</MenuItem>
          )}
        </FormSelect>
        <SelectionHelperText currentSelection={currentRecipientSelectionValue}
                             messageType={messageType}
                             customSelectedEntities={customSelectedRecipients}
                             numberOfSelectedRecipients={numberOfRecipients}
                             onEditCustomSelectedEntities={handleStartEditCustomSelectedRecipients} />
        { showCustomSelectionDialog && <SingleSelectionDialog open={showCustomSelectionDialog}
                                                              selectableEntities={recipients.data || []}
                                                              customSelectedEntities={customSelectedRecipients}
                                                              onClose={handleFinishEditCustomSelectedRecipients} /> }
      </Box>
  );
}


interface SelectionHelperTextProps {
  messageType: MessageType;
  customSelectedEntities?: Recipient[];
  currentSelection: string;
  numberOfSelectedRecipients: number | null;
  onEditCustomSelectedEntities: CallbackHandler;
}
function SelectionHelperText({messageType, currentSelection, customSelectedEntities, onEditCustomSelectedEntities, numberOfSelectedRecipients}: SelectionHelperTextProps) {

  const {t} = useTranslation(['admin', 'common']);

  const {getRecipientName} = useRecipientName();

  if (isStringEmpty(currentSelection)) {
    return null;
  }

  if (isArrayNotEmpty(customSelectedEntities)) {
    const customSelectEntitiesList = customSelectedEntities.map(entity =>
        <SmallTitle key={entity.id}>{getRecipientName(entity)}</SmallTitle>
    );
    const label = messageType === MessageType.MESSAGE_TYPE_PARTICIPANTS ? t('admin:participant_selection_single_selection_text') : t('admin:team_selection_single_selection_text');
    return <>
      <Typography variant={"subtitle2"}>
        {label}
        <IconButton onClick={onEditCustomSelectedEntities}
                    aria-label={t("common:change")}
                    size="large">
          <EditIcon />
        </IconButton>
      </Typography>
      {customSelectEntitiesList}
    </>;
  }

  if (messageType === MessageType.MESSAGE_TYPE_PARTICIPANTS) {
    if (currentSelection === CONSTANTS.PARTICIPANT_SELECTION.ASSIGNED_TO_TEAM) {
      return <Box sx={{ mt: 1}}><Span html={true} i18n="admin:participant_selection_assigned_to_teams_text" parameters={{numberOfSelectedParticipants: numberOfSelectedRecipients}}/></Box>;
    } else if (currentSelection === CONSTANTS.PARTICIPANT_SELECTION.NOT_ASSIGNED_TO_TEAM) {
      return <Box sx={{ mt: 1}}><Span html={true} i18n="admin:participant_selection_not_assigned_to_teams_text" parameters={{numberOfSelectedParticipants: numberOfSelectedRecipients}}/></Box>;
    } else {
      return <Box sx={{ mt: 1}}><Span html={true} i18n="admin:participant_selection_all_text" parameters={{numberOfSelectedParticipants: numberOfSelectedRecipients}}/></Box>;
    }
  } else {
    return <Box sx={{ mt: 1}}><Span html={true} i18n="admin:team_selection_all_text" parameters={{numTeams: numberOfSelectedRecipients}}/></Box>;
  }
}

export {
  RecipientSelection
};
