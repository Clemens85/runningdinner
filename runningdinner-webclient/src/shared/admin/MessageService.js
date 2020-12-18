import BackendConfig from "../BackendConfig";
import axios from "axios";
import {CONSTANTS} from "../Constants";
import {isStringEmpty} from "../Utils";
import cloneDeep from 'lodash/cloneDeep';
import filter from 'lodash/filter';

export const ParticipantSelectionChoices = [
  { value: CONSTANTS.PARTICIPANT_SELECTION.ALL, label: 'Alle' },
  { value: CONSTANTS.PARTICIPANT_SELECTION.ASSIGNED_TO_TEAM, label: 'Nur Teilnehmer in Teams' },
  { value: CONSTANTS.PARTICIPANT_SELECTION.NOT_ASSIGNED_TO_TEAM, label: 'Nur Teilnehmer auf Warteliste' },
  { value: CONSTANTS.PARTICIPANT_SELECTION.CUSTOM_SELECTION, label: 'Einzelauswahl...' }
];

export default class MessageService {

  // TODO: Unify these methods:

  static async sendParticipantMessagesAsync(adminId, participantMailMessage, incomingSendToDinnerOwner) {
    const sendToDinnerOwner = incomingSendToDinnerOwner === true ? 'true' : 'false';
    const url = BackendConfig.buildUrl(`/messageservice/v1/runningdinner/${adminId}/mails/participant?sendToDinnerOwner=${sendToDinnerOwner}`);
    const response = await axios({
      url: url,
      method: 'put',
      data: mapEmptySelectionStringToNull(participantMailMessage)
    });
    return response.data;
  }
  static async getParticipantMailPreviewAsync(adminId, participantMailMessageTemplate, participantToUse) {
    const url = BackendConfig.buildUrl(`/messageservice/v1/runningdinner/${adminId}/mails/participant/preview`);
    let participantMailMessage = MessageService.getMailMessageForSelectedRecipient(participantMailMessageTemplate, participantToUse);
    const response = await axios.put(url, participantMailMessage);
    return response.data;
  }

  static async sendTeamMessagesAsync(adminId, teamMailMessage, incomingSendToDinnerOwner) {
    const sendToDinnerOwner = incomingSendToDinnerOwner === true ? 'true' : 'false';
    const url = BackendConfig.buildUrl(`/messageservice/v1/runningdinner/${adminId}/mails/team?sendToDinnerOwner=${sendToDinnerOwner}`);
    const response = await axios({
      url: url,
      method: 'put',
      data: mapEmptySelectionStringToNull(teamMailMessage)
    });
    return response.data;
  }

  static async getTeamMailPreviewAsync(adminId, teamMailMessageTemplate, teamToUse) {
    const url = BackendConfig.buildUrl(`/messageservice/v1/runningdinner/${adminId}/mails/team/preview`);
    let teamtMailMessage = MessageService.getMailMessageForSelectedRecipient(teamMailMessageTemplate, teamToUse);
    const response = await axios.put(url, teamtMailMessage);
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

  static getNumberOfSelectedParticipants(participants, participantSelection) {
    if (!participants || participants.length <= 0 || isStringEmpty(participantSelection) || participantSelection === CONSTANTS.PARTICIPANT_SELECTION.CUSTOM_SELECTION) {
      return null;
    }

    if (participantSelection === CONSTANTS.PARTICIPANT_SELECTION.ALL) {
      return participants.length;
    }

    const assignedParticipants = filter(participants, {'assignmentType': CONSTANTS.ASSIGNMENT_TYPE.ASSIGNED_TO_TEAM});
    var assignedParticipantsSize = assignedParticipants.length;
    if (participantSelection === CONSTANTS.PARTICIPANT_SELECTION.ASSIGNED_TO_TEAM) {
      return assignedParticipantsSize;
    } else if (participantSelection === CONSTANTS.PARTICIPANT_SELECTION.ASSIGNED_TO_TEAM) {
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
