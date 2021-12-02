import {isArrayEmpty, isStringNotEmpty, MessageTeamsType, MessageType} from "@runningdinner/shared";
import {MESSAGE_TEAMS_TYPE_QUERY_PARAM, SELECTED_TEAM_IDS_QUERY_PARAM} from "../AdminNavigationHook";
import {useQuery} from "../../common/hooks/QueryHook";

export function useMessagesQueryHandler(messageType: MessageType) {

  const query = useQuery();

  function getHeadline() {
    const messageTeamsType = query.get(MESSAGE_TEAMS_TYPE_QUERY_PARAM);
    if (messageType === MessageType.MESSAGE_TYPE_DINNERROUTE) {
      return 'admin:mails_senddinnerroute_sendmessage';
    } else if (messageType === MessageType.MESSAGE_TYPE_PARTICIPANTS) {
      return 'admin:mails_participant_sendmessage_headline';
    } else if (messageType === MessageType.MESSAGE_TYPE_TEAMS) {
      let result = 'admin:mails_team_sendmessage_headline';
      if (messageTeamsType === MessageTeamsType.SINGLE) {
        result = 'admin:team_single_message_headline';
      } else if (messageTeamsType === MessageTeamsType.CANCELLATION) {
        result = 'admin:team_cancellation_message_headline';
      }
      return result;
    } else {
      throw new Error(`Unknown messageType ${messageType}`);
    }
  }

  function getSelectedTeamIds() {
    const selectedTeamIds = query.get(SELECTED_TEAM_IDS_QUERY_PARAM);
    let result = isStringNotEmpty(selectedTeamIds) ? selectedTeamIds.split(",") : [];
    if (messageType === MessageType.MESSAGE_TYPE_PARTICIPANTS || isArrayEmpty(result)) {
      return [];
    }
    return result.map(teamId => teamId.trim());
  }

  const headline = getHeadline();
  const selectedTeamIds = getSelectedTeamIds();

  return {
    headline,
    selectedTeamIds
  };
}