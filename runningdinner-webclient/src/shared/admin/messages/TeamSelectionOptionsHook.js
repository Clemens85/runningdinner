import {CONSTANTS} from "shared/Constants";
import {useTranslation} from "react-i18next";

function useTeamSelectionOptions() {
  const {t} = useTranslation(['admin']);
  return [
    { value: CONSTANTS.TEAM_SELECTION.ALL, label: t('team_selection_all') },
    { value: CONSTANTS.TEAM_SELECTION.CUSTOM_SELECTION, label: t('team_selection_single_selection') }
  ];
}

export default useTeamSelectionOptions;
