import BackendConfig from "../BackendConfig";
import axios from "axios";
import {CONSTANTS} from "../Constants";
import {isArrayEmpty, isStringEmpty} from "../Utils";
import cloneDeep from 'lodash/cloneDeep';
import filter from 'lodash/filter';

export const MESSAGE_TYPE_PARTICIPANTS = "MESSAGE_TYPE_PARTICIPANTS";
export const MESSAGE_TYPE_TEAMS = "MESSAGE_TYPE_TEAMS";
export const MESSAGE_TYPE_DINNERROUTE = "MESSAGE_TYPE_DINNERROUTE";

export default class MessageService {

  static async sendMessagesAsync(adminId, messageObject, messageType, sendToDinnerOwner) {
    const sendToDinnerOwnerStr = sendToDinnerOwner === true ? 'true' : 'false';
    const recipientType = mapRecipientType(messageType);
    const url = BackendConfig.buildUrl(`/messageservice/v1/runningdinner/${adminId}/mails/${recipientType}?sendToDinnerOwner=${sendToDinnerOwnerStr}`);
    const response = await axios({
      url: url,
      method: 'put',
      data: mapEmptySelectionStringToNull(messageObject)
    });
    return response.data;
  }

  static async getMessagePreviewAsync(adminId, messageTemplate, recipientToUse, messageType) {
    const recipientType = mapRecipientType(messageType);
    const url = BackendConfig.buildUrl(`/messageservice/v1/runningdinner/${adminId}/mails/${recipientType}/preview`);
    let messageObject = MessageService.getMailMessageForSelectedRecipient(messageTemplate, recipientToUse);
    const response = await axios.put(url, messageObject);
    return response.data;
  }

  static async sendTeamPartnerWishInvitationAsync(adminId, participant) {
    const {id} = participant;
    const url = BackendConfig.buildUrl(`/messageservice/v1/runningdinner/${adminId}/mails/teampartnerwish/${id}`);
    const response = await axios.put(url);
    return response.data;
  }

  static getMailMessageForSelectedRecipient(mailMessageTemplate, recipientForPreview) {
    let mailMessage = mailMessageTemplate;
    mailMessage = mapEmptySelectionStringToNull(mailMessage);
    if (recipientForPreview) {
      mailMessage = cloneDeep(mailMessageTemplate);
      mailMessage.participantSelection = CONSTANTS.PARTICIPANT_SELECTION.CUSTOM_SELECTION;
      mailMessage.teamSelection = CONSTANTS.TEAM_SELECTION.CUSTOM_SELECTION;
      mailMessage.customSelectedParticipantIds = [recipientForPreview.id];
      mailMessage.customSelectedTeamIds = [recipientForPreview.id];
    }
    return mailMessage;
  }

  static getExampleParticipantMessage() {
    return {
      subject: '',
      message: 'Hallo {firstname} {lastname},\n\n' +
               ' *DEIN TEXT*',
      participantSelection: ''
    };
  }
  static getExampleTeamMessage() {
    return {
      subject: '',
      message: 'Hallo {firstname} {lastname},\n' +
          '\n' +
          'dein(e) Tempartner ist/sind:\n' +
          '\n' +
          '{partner}.\n' +
          '\n' +
          'Ihr seid für folgende Speise verantwortlich: {meal}.\n' +
          'Diese soll um {mealtime} eingenommen werden.\n' +
          '\n' +
          '{host}',
      teamSelection: '',
      hostMessagePartTemplate: 'Es wird vorgeschlagen, dass du als Gastgeber fungierst. Wenn dies nicht in Ordnung ist, dann sprecht euch bitte ab und gebt uns Rückmeldung wer als neuer Gastgeber fungieren soll.',
      nonHostMessagePartTemplate: 'Als Gastgeber wurde {partner} vorgeschlagen.'
    };
  }

  static getNumberOfSelectedRecipients(recipients, recipientSelection) {
    if (isArrayEmpty(recipients) || isStringEmpty(recipientSelection) ||
        recipientSelection === CONSTANTS.PARTICIPANT_SELECTION.CUSTOM_SELECTION || recipientSelection === CONSTANTS.TEAM_SELECTION.CUSTOM_SELECTION) {
      return null;
    }
    if (recipientSelection === CONSTANTS.PARTICIPANT_SELECTION.ALL || recipientSelection === CONSTANTS.TEAM_SELECTION.ALL) {
      return recipients.length;
    }
    return MessageService._getNumberOfSelectedParticipants(recipients, recipientSelection);
  }

  static _getNumberOfSelectedParticipants(participants, participantSelection) {
    const assignedParticipants = filter(participants, {'assignmentType': CONSTANTS.ASSIGNMENT_TYPE.ASSIGNED_TO_TEAM});
    var assignedParticipantsSize = assignedParticipants.length;
    if (participantSelection === CONSTANTS.PARTICIPANT_SELECTION.ASSIGNED_TO_TEAM) {
      return assignedParticipantsSize;
    } else if (participantSelection === CONSTANTS.PARTICIPANT_SELECTION.NOT_ASSIGNED_TO_TEAM) {
      return participants.length - assignedParticipantsSize;
    }
    return null;
  }

};

function mapEmptySelectionStringToNull(incomingMailMessage) {
  if (isStringEmpty(incomingMailMessage)) {
    const result = cloneDeep(incomingMailMessage);
    result.participantSelection = null;
    result.teamSelection = null;
    return result;
  }
  return incomingMailMessage;
}

function mapRecipientType(messageType) {
  if (messageType === MESSAGE_TYPE_PARTICIPANTS) {
    return "participant"
  } else if (messageType === MESSAGE_TYPE_TEAMS) {
    return "team";
  } else if (messageType === MESSAGE_TYPE_DINNERROUTE) {
    return "dinnerroute";
  }
  throw new Error(`Unknown messageType: ${messageType}`);
}
