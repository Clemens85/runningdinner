import {BackendConfig} from "../BackendConfig";
import axios from "axios";
import {isArrayEmpty, isStringEmpty} from "../Utils";
import cloneDeep from 'lodash/cloneDeep';
import filter from 'lodash/filter';
import get from 'lodash/get';
import {
  BaseEntity,
  BaseMessage,
  BaseTeamMessage, DinnerRouteMessage,
  MessageJob, MessageJobOverview,
  MessageTask,
  MessageType,
  Participant,
  ParticipantMessage,
  ParticipantSelection,
  PreviewMessageList,
  Recipient,
  SendingStatus,
  TeamMessage,
  TeamSelection
} from "../types";
import {CONSTANTS} from "../Constants";
import find from "lodash/find";

export async function findMessageJobsByAdminIdAndTypeAsync(adminId: string, messageType: MessageType): Promise<MessageJob[]> {
  const url = BackendConfig.buildUrl(`/messageservice/v1/runningdinner/${adminId}/messagejobs?messageType=${messageType}`);
  const response = await axios.get(url);
  return response.data;
}

export async function findMessageJobOverviewByAdminIdAndMessageJobId(adminId: string, messageJobId: string): Promise<MessageJobOverview> {
  const url = BackendConfig.buildUrl(`/messageservice/v1/runningdinner/${adminId}/messagejobs/${messageJobId}/overview`);
  const response = await axios.get(url);
  return response.data;
}

export async function findMessageJobByAdminIdAndJobIdAsync(adminId: string, messageJobId: string): Promise<MessageJob> {
  const url = BackendConfig.buildUrl(`/messageservice/v1/runningdinner/${adminId}/messagejobs/${messageJobId}`);
  const response = await axios.get(url);
  return response.data;
}

export async function findMessageTasksByAdminIdAndJobIdAsync(adminId: string, messageJobId: string): Promise<MessageTask[]> {
  const url = BackendConfig.buildUrl(`/messageservice/v1/runningdinner/${adminId}/messagetasks/${messageJobId}`);
  const response = await axios.get(url);
  return response.data;
}


export async function sendMessagesAsync<T extends BaseMessage>(adminId: string, messageObject: T, messageType: MessageType, sendToDinnerOwner: boolean): Promise<MessageJob> {
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

export async function reSendMessageTaskAsync(adminId: string, messageTask: MessageTask) {
  const {id} = messageTask;
  const url = BackendConfig.buildUrl(`/messageservice/v1/runningdinner/${adminId}/messagetask/${id}`);
  const response = await axios.put(url, messageTask);
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

export function isOneMessageJobNotFinished(messageJobs: MessageJob[]) {
  return find(messageJobs, function(messageJob) {
    const status = getStatusResult(messageJob);
    return status === CONSTANTS.SENDING_STATUS_RESULT.SENDING_NOT_FINISHED;
  });
}

export function getExampleParticipantMessage(): ParticipantMessage {
  return {
    subject: '',
    message: 'Hallo {firstname} {lastname},\n\n' +
             ' *DEIN TEXT*',
    participantSelection: ParticipantSelection.ALL
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
        '{host}\n' + 
        '\n' + 
        'Alternativ kann jeder von euch die Gastgebereinteilung bis zur endgültigen Festlegung der Dinnerrouten unter folgendem Link selbst ändern: {managehostlink}\nSprecht euch hierfür jedoch bitte untereinander ab!',
    hostMessagePartTemplate: 'Es wird vorgeschlagen, dass du als Gastgeber fungierst. Wenn dies nicht in Ordnung ist, dann sprecht euch bitte ab und gebt uns Rückmeldung wer als neuer Gastgeber fungieren soll.',
    nonHostMessagePartTemplate: 'Als Gastgeber wurde {partner} vorgeschlagen.',
    teamSelection: TeamSelection.ALL
  };
}

export function getExampleDinnerRouteMessage(): DinnerRouteMessage {
  return {
    subject: '',
    message: "Hallo {firstname},\n\n" +
      "hier ist eure Dinner-Route: \n\n{route}\n\nU" +
      "nter folgendem Link findet ihr jederzeit eine Live-Ansicht eurer Dinner-Route:\n{routelink}\n\n" +
      "Bitte versucht euch an die Zeitpläne zu halten!",
    selfTemplate: "{meal} bei EUCH\nGekocht wird bei {firstname} {lastname}\nUhrzeit: {mealtime} Uhr\n{mealspecifics}",
    hostsTemplate: "{meal}\nWird gekocht bei: {firstname} {lastname}\n{hostaddress}\nKontakt (Handy/Telefon): {mobilenumber}\nUhrzeit: {mealtime} Uhr",
    teamSelection: TeamSelection.ALL
  };
}

export function getNumberOfSelectedRecipients(recipients: Recipient[], recipientSelection: string): number | null {
  if (isArrayEmpty(recipients) || isStringEmpty(recipientSelection) ||
      recipientSelection === CONSTANTS.RECIPIENT_SELECTION_COMMON.CUSTOM_SELECTION) {
    return null;
  }
  if (recipientSelection === CONSTANTS.RECIPIENT_SELECTION_COMMON.ALL) {
    return recipients.length;
  }
  return _getNumberOfSelectedParticipants(recipients as Participant[], recipientSelection);
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
