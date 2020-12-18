import React from "react";
import { Box, MenuItem, Typography, IconButton } from "@material-ui/core";
import EditIcon from '@material-ui/icons/Edit';
import {isStringEmpty} from "shared/Utils";
import SelectWatchable from "common/input/SelectWatchable";
import {CONSTANTS} from "shared/Constants";
import {SingleSelectionDialog} from "admin/messages/SingleSelectionDialog";
import {isArrayNotEmpty} from "shared/Utils";
import {useTranslation} from "react-i18next";
import TeamNr from "shared/TeamNr";
import {SmallTitle, Span} from "common/theme/typography/Tags";
import {
  START_EDIT_CUSTOM_SELECTED_RECIPIENTS,
  newAction,
  RECIPIENTS_SELECTION_CHANGE,
  useTeamMessagesDispatch,
  useTeamMessagesState,
  FINISH_EDIT_CUSTOM_SELECTED_RECIPIENTS
} from "admin/messages/teams/TeamMessagesContext";
import useTeamSelectionOptions from "shared/admin/messages/TeamSelectionOptionsHook";
import {useFormContext} from "react-hook-form";

function TeamSelection() {

  const {t} = useTranslation('admin');
  const dispatch = useTeamMessagesDispatch();
  const { setValue } = useFormContext();
  const {teams, teamSelection, customSelectedTeams, showCustomSelectionDialog} = useTeamMessagesState();

  React.useEffect(() => {
    setValue("teamSelection", teamSelection);
  }, [teamSelection, setValue]);

  let teamSelectionOptions = useTeamSelectionOptions();
  teamSelectionOptions = teamSelectionOptions.map((selectionOption) =>
      <MenuItem value={selectionOption.value} key={selectionOption.value}>{selectionOption.label}</MenuItem>
  );

  const handleSelectionChange = newValue => dispatch(newAction(RECIPIENTS_SELECTION_CHANGE, newValue));
  const handleStartEditCustomSelectedTeams = () => dispatch(newAction(START_EDIT_CUSTOM_SELECTED_RECIPIENTS));
  const handleFinishEditCustomSelectedTeams = customSelectedEntities => dispatch(newAction(FINISH_EDIT_CUSTOM_SELECTED_RECIPIENTS, customSelectedEntities));

  const numberOfTeams = teams.length;
  return (
      <Box mb={3} mt={2}>
        <SelectWatchable name="teamSelection"
                         label={t("admin:team_selection_text")}
                         selectionOptions={teamSelectionOptions}
                         onChange={handleSelectionChange} />
        <SelectionHelperText currentSelection={teamSelection}
                             customSelectedEntities={customSelectedTeams}
                             numberOfAllEntities={numberOfTeams}
                             onEditCustomSelectedEntities={handleStartEditCustomSelectedTeams} />
        { showCustomSelectionDialog && <SingleSelectionDialog open={showCustomSelectionDialog}
                                                              selectableEntities={teams}
                                                              customSelectedEntities={customSelectedTeams}
                                                              onClose={handleFinishEditCustomSelectedTeams} /> }
      </Box>
  );
}

function SelectionHelperText({currentSelection, customSelectedEntities, onEditCustomSelectedEntities, numberOfAllEntities}) {

  const {t} = useTranslation(['admin', 'common']);

  if (isStringEmpty(currentSelection)) {
    return null;
  }

  if (currentSelection === CONSTANTS.TEAM_SELECTION.CUSTOM_SELECTION && isArrayNotEmpty(customSelectedEntities)) {
    const customSelectEntitiesList = customSelectedEntities.map(entity =>
        <SmallTitle key={entity.id}><TeamNr {...entity} /></SmallTitle>
    );
    return (
        <>
          <Typography variant={"subtitle2"}>
            {t('admin:team_selection_single_selection_text')} <IconButton onClick={onEditCustomSelectedEntities} aria-label={t("common:change")}><EditIcon /></IconButton>
          </Typography>
          {customSelectEntitiesList}
        </>
    );
  }
  return (
      <Span html={true} i18n="admin:team_selection_all_text" parameters={{numTeams: numberOfAllEntities}} />
  );
}

export {
  TeamSelection
};
