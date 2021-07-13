import React from "react";
import {Box, IconButton, LinearProgress, MenuItem, Typography} from "@material-ui/core";
import EditIcon from '@material-ui/icons/Edit';
import FormSelect from "../../common/input/FormSelect";
import {SingleSelectionDialog} from "./SingleSelectionDialog";
import {
  CallbackHandler,
  CONSTANTS,
  getNumberOfSelectedRecipients,
  isArrayNotEmpty,
  isStringEmpty,
  MessageType,
  Recipient,
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
  updateRecipientSelection
} from "@runningdinner/shared";
import {useDispatch} from "react-redux";
import {FetchStatus} from "@runningdinner/shared/src/redux";

function RecipientSelection({messageType}: MessageTypeAdminIdPayload) {

  const {t} = useTranslation('admin');
  const dispatch = useDispatch();
  const { setValue, watch } = useFormContext();
  const {recipients, recipientSelection, customSelectedRecipients, showCustomSelectionDialog} = useAdminSelector(getRecipientsSelector);

  const teamSelectionOptions = useTeamSelectionOptions();
  const participantSelectionOptions = useParticipantSelectionOptions();

  const name = messageType === MessageType.MESSAGE_TYPE_PARTICIPANTS ? "participantSelection" : "teamSelection";
  const label = messageType === MessageType.MESSAGE_TYPE_PARTICIPANTS ? t("participant_selection_text") : t("admin:team_selection_text");

  const currentRecipientSelectionValue = watch(name);
  React.useEffect(() => {
    dispatch(updateRecipientSelection(currentRecipientSelectionValue));
  }, [currentRecipientSelectionValue, dispatch]);

  React.useEffect(() => {
    setValue(name, recipientSelection);
  }, [recipientSelection, name, setValue]);

  if (recipients.fetchStatus !== FetchStatus.SUCCEEDED) {
    return <LinearProgress variant={"indeterminate"} />;
  }

  let recipientSelectionOptions = messageType === MessageType.MESSAGE_TYPE_PARTICIPANTS ? participantSelectionOptions : teamSelectionOptions;

  const handleStartEditCustomSelectedRecipients = () => dispatch(startEditCustomSelectedRecipients());
  const handleFinishEditCustomSelectedRecipients = (customSelectedEntities: Recipient[]) => dispatch(finishEditCustomSelectedRecipients(customSelectedEntities));

  const numberOfRecipients = getNumberOfSelectedRecipients(recipients.data || [], recipientSelection);
  return (
      <Box mb={3} mt={2}>
        <FormSelect name={name}
                    label={label}
                    displayEmpty
                    fullWidth>
          { recipientSelectionOptions.map((selectionOption) =>
              <MenuItem value={selectionOption.value} key={selectionOption.value}>{selectionOption.label}</MenuItem>
          )}
        </FormSelect>
        <SelectionHelperText currentSelection={recipientSelection}
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
    return (
        <>
          <Typography variant={"subtitle2"}>
            {label} <IconButton onClick={onEditCustomSelectedEntities} aria-label={t("common:change")}><EditIcon /></IconButton>
          </Typography>
          {customSelectEntitiesList}
        </>
    );
  }

  if (messageType === MessageType.MESSAGE_TYPE_PARTICIPANTS) {
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