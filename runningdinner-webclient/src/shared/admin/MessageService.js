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
    let participantMailMessage = MessageService.getMailMessageForSelectedParticipant(participantMailMessageTemplate, participantToUse);
    const response = await axios.put(url, participantMailMessage);
    return response.data;
  }

  static async sendTeamPartnerWishInvitationAsync(adminId, participant) {
    const {id} = participant;
    const url = BackendConfig.buildUrl(`/messageservice/v1/runningdinner/${adminId}/mails/teampartnerwish/${id}`);
    const response = await axios.put(url);
    return response.data;
  }

  static getMailMessageForSelectedParticipant(participantMailMessageTemplate, participantToUse) {
    let participantMailMessage = participantMailMessageTemplate;
    participantMailMessage = mapEmptySelectionStringToNull(participantMailMessage);
    if (participantToUse) {
      participantMailMessage = cloneDeep(participantMailMessageTemplate);
      participantMailMessage.participantSelection = CONSTANTS.PARTICIPANT_SELECTION.CUSTOM_SELECTION;
      participantMailMessage.customSelectedParticipantIds = [participantToUse.id];
    }
    return participantMailMessage;
  }

  static getExampleParticipantMessage() {
    return {
      subject: '',
      message: 'Hallo {firstname} {lastname},\n\n' +
               ' *DEIN TEXT*',
      participantSelection: ''
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
    return result;
  }
  return incomingMailMessage;
}
