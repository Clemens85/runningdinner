import {useTranslation} from "react-i18next";

function useTeamName(team) {
  const {t} = useTranslation(['admin']);

  function getTeamName(team) {
    return t('team', {teamNumber: team.teamNumber});
  }

  const teamName = team ? getTeamName(team) : undefined;

  return { teamName, getTeamName };
}

export default useTeamName;



