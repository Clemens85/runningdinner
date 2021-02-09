import { BackendConfig } from "../BackendConfig";
import axios from "axios";
import {isArrayEmpty, isStringEmpty} from "../Utils";
import cloneDeep from 'lodash/cloneDeep';
import filter from 'lodash/filter';
import get from 'lodash/get';
import {
  BaseMessage,
  BaseTeamMessage,
  MessageJob,
  MessageTask,
  MessageType,
  ParticipantMessage,
  ParticipantSelection,
  PreviewMessageList, SendingStatus,
  TeamMessage,
  TeamSelection
} from "../types";
import {BaseEntity, Participant} from "../types";
import {CONSTANTS} from "../Constants";

export async function findMessageJobsByAdminIdAndTypeAsync(adminId: string, messageType: MessageType): Promise<MessageJob> {
  const url = BackendConfig.buildUrl(`/messageservice/v1/runningdinner/${adminId}/messagejobs?messageType=${messageType}`);
  const response = await axios.get(url);
  return response.data;
}

export async function sendMessagesAsync<T extends BaseMessage>(adminId: string, messageObject: T, messageType: MessageType, sendToDinnerOwner: boolean) {
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

export async function getMessagePreviewAsync<T extends BaseMessage>(adminId: string, messageTemplate: T, recipientToUse: BaseEntity, messageType: MessageType): Promise<PreviewMessageList> {
  const recipientType = mapRecipientType(messageType);
  const url = BackendConfig.buildUrl(`/messageservice/v1/runningdinner/${adminId}/mails/${recipientType}/preview`);
  let messageObject = getMailMessageForSelectedRecipient(messageTemplate, messageType, recipientToUse);
  const response = await axios.put(url, messageObject);
  return response.data;
}

export async function sendTeamPartnerWishInvitationAsync(adminId: string, participant: Participant): Promise<MessageJob> {
  const {id} = participant;
  const url = BackendConfig.buildUrl(`/messageservice/v1/runningdinner/${adminId}/mails/teampartnerwish/${id}`);
  const response = await axios.put(url);
  return response.data;
}

export function getMailMessageForSelectedRecipient<T extends BaseMessage>(mailMessageTemplate: T, messageType: MessageType, recipientForPreview: BaseEntity) {
    let mailMessage = mailMessageTemplate;
    mailMessage = mapEmptySelectionStringToNull(mailMessage);
    if (recipientForPreview) {
      mailMessage = cloneDeep(mailMessageTemplate);
      if (messageType === MessageType.MESSAGE_TYPE_DINNERROUTE || messageType == MessageType.MESSAGE_TYPE_TEAMS) {
        (mailMessage as BaseTeamMessage).teamSelection = TeamSelection.CUSTOM_SELECTION;
        // @ts-ignore
        (mailMessage as BaseTeamMessage).customSelectedTeamIds = [recipientForPreview?.id];
      } else {
        (mailMessage as ParticipantMessage).participantSelection = ParticipantSelection.CUSTOM_SELECTION;
        // @ts-ignore
        (mailMessage as ParticipantMessage).customSelectedParticipantIds = [recipientForPreview?.id];
      }
    }
    return mailMessage;
  }

export function getStatusResult(messageJobOrTask: MessageJob | MessageTask): string {
  const sendingStatus = messageJobOrTask.sendingStatus;
  if (sendingStatus !== SendingStatus.SENDING_FINISHED) {
    return CONSTANTS.SENDING_STATUS_RESULT.SENDING_NOT_FINISHED;
  }

  let sendingFailed = get(messageJobOrTask, "sendingFailed", null);
  if (!sendingFailed) {
    sendingFailed = get(messageJobOrTask, 'sendingResult.delieveryFailed', null);
    if (sendingFailed === true) {
      sendingFailed = "TRUE";
    } else {
      sendingFailed = "FALSE";
    }
  }

  if (sendingFailed === 'TRUE') {
    return CONSTANTS.SENDING_STATUS_RESULT.SENDING_FINISHED_FAILURE;
  } else {
    return CONSTANTS.SENDING_STATUS_RESULT.SENDING_FINISHED_SUCCESS;
  }
}

export function getExampleParticipantMessage(): ParticipantMessage {
  return {
    subject: '',
    message: 'Hallo {firstname} {lastname},\n\n' +
             ' *DEIN TEXT*'
  };
}

export function getExampleTeamMessage(): TeamMessage {
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
    hostMessagePartTemplate: 'Es wird vorgeschlagen, dass du als Gastgeber fungierst. Wenn dies nicht in Ordnung ist, dann sprecht euch bitte ab und gebt uns Rückmeldung wer als neuer Gastgeber fungieren soll.',
    nonHostMessagePartTemplate: 'Als Gastgeber wurde {partner} vorgeschlagen.'
  };
}

export function getNumberOfSelectedRecipients(recipients: Participant[], recipientSelection: string): number | null {
  if (isArrayEmpty(recipients) || isStringEmpty(recipientSelection) ||
      recipientSelection === CONSTANTS.PARTICIPANT_SELECTION.CUSTOM_SELECTION || recipientSelection === CONSTANTS.TEAM_SELECTION.CUSTOM_SELECTION) {
    return null;
  }
  if (recipientSelection === CONSTANTS.PARTICIPANT_SELECTION.ALL || recipientSelection === CONSTANTS.TEAM_SELECTION.ALL) {
    return recipients.length;
  }
  return _getNumberOfSelectedParticipants(recipients, recipientSelection);
}

function _getNumberOfSelectedParticipants(participants: Participant[], participantSelection: string): number | null {
  const assignedParticipants = filter(participants, {'assignmentType': CONSTANTS.ASSIGNMENT_TYPE.ASSIGNED_TO_TEAM});
  var assignedParticipantsSize = assignedParticipants.length;
  if (participantSelection === CONSTANTS.PARTICIPANT_SELECTION.ASSIGNED_TO_TEAM) {
    return assignedParticipantsSize;
  } else if (participantSelection === CONSTANTS.PARTICIPANT_SELECTION.NOT_ASSIGNED_TO_TEAM) {
    return participants.length - assignedParticipantsSize;
  }
  return null;
}


function mapEmptySelectionStringToNull<T extends BaseMessage>(incomingMailMessage: T): T {
  const result = cloneDeep(incomingMailMessage);
  if ((result as any).participantSelection && (result as any).participantSelection === '') {
    (result as any).participantSelection = null;
  }
  if ((result as any).teamSelection && (result as any).teamSelection === '') {
    (result as any).teamSelection = null;
  }
  return result;
}

function mapRecipientType(messageType: MessageType): string {
  if (messageType === MessageType.MESSAGE_TYPE_PARTICIPANTS) {
    return "participant"
  } else if (messageType === MessageType.MESSAGE_TYPE_TEAMS) {
    return "team";
  } else if (messageType === MessageType.MESSAGE_TYPE_DINNERROUTE) {
    return "dinnerroute";
  }
  throw new Error(`Unknown messageType: ${messageType}`);
}
