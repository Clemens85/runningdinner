import {CONSTANTS} from "shared/Constants";
import {useTranslation} from "react-i18next";

function useParticipantSelectionOptions() {
  const {t} = useTranslation(['admin']);
  return [
    { value: CONSTANTS.PARTICIPANT_SELECTION.ALL, label: t('participant_selection_all') },
    { value: CONSTANTS.PARTICIPANT_SELECTION.ASSIGNED_TO_TEAM, label: t('participant_selection_assigned_to_teams') },
    { value: CONSTANTS.PARTICIPANT_SELECTION.NOT_ASSIGNED_TO_TEAM, label: t('participant_selection_not_assigned_to_teams') },
    { value: CONSTANTS.PARTICIPANT_SELECTION.CUSTOM_SELECTION, label: t('participant_selection_single_selection') }
  ];
}

export default useParticipantSelectionOptions;
