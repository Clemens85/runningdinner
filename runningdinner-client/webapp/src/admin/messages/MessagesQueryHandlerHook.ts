import { isArrayEmpty, isStringNotEmpty, MessageSubType, MessageType } from '@runningdinner/shared';
import { MESSAGE_SUBTYPE_QUERY_PARAM, SELECTED_TEAM_IDS_QUERY_PARAM } from '../AdminNavigationHook';
import { useUrlQuery } from '../../common/hooks/useUrlQuery';

export function useMessagesQueryHandler(messageType: MessageType) {
  const query = useUrlQuery();

  function getHeadline() {
    const messageSubType = query.get(MESSAGE_SUBTYPE_QUERY_PARAM);
    if (messageType === MessageType.MESSAGE_TYPE_DINNERROUTE) {
      return 'admin:mails_senddinnerroute_sendmessage';
    } else if (messageType === MessageType.MESSAGE_TYPE_PARTICIPANTS) {
      return 'admin:mails_participant_sendmessage_headline';
    } else if (messageType === MessageType.MESSAGE_TYPE_TEAMS) {
      let result = 'admin:mails_team_sendmessage_headline';
      if (messageSubType === MessageSubType.TEAM_SINGLE) {
        result = 'admin:team_single_message_headline';
      } else if (messageSubType === MessageSubType.TEAM_CANCELLATION) {
        result = 'admin:team_cancellation_message_headline';
      } else if (messageSubType === MessageSubType.TEAMS_MODIFIED_WAITINGLIST) {
        result = 'admin:teams_modified_waitinglist_message_headline';
      }
      return result;
    } else {
      throw new Error(`Unknown messageType ${messageType}`);
    }
  }

  function getSelectedTeamIds() {
    const selectedTeamIds = query.get(SELECTED_TEAM_IDS_QUERY_PARAM);
    const result = isStringNotEmpty(selectedTeamIds) ? selectedTeamIds.split(',') : [];
    if (messageType === MessageType.MESSAGE_TYPE_PARTICIPANTS || isArrayEmpty(result)) {
      return [];
    }
    return result.map((teamId) => teamId.trim());
  }

  function isPreselectAllRecipients() {
    const messageSubType = query.get(MESSAGE_SUBTYPE_QUERY_PARAM);
    return !messageSubType || MessageSubType.RECIPIENTS_ALL === messageSubType || MessageSubType.DEFAULT === messageSubType;
  }

  const headline = getHeadline();
  const selectedTeamIds = getSelectedTeamIds();
  const preselectAllRecipients = isPreselectAllRecipients();

  return {
    headline,
    selectedTeamIds,
    preselectAllRecipients,
  };
}
