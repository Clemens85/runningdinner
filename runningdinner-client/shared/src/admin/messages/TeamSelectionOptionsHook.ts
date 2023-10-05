import {useTranslation} from "react-i18next";
import { CONSTANTS } from "../../Constants";

export function useTeamSelectionOptions() {
  const {t} = useTranslation(['admin']);
  return [
    { value: CONSTANTS.RECIPIENT_SELECTION_COMMON.ALL, label: t('team_selection_all') },
    { value: CONSTANTS.RECIPIENT_SELECTION_COMMON.CUSTOM_SELECTION, label: t('team_selection_single_selection') }
  ];
}
