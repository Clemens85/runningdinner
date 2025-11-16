import { CONSTANTS, getExampleParticipantMessage } from '../..';
import { BackendIssue, BaseMessage, MessageJob, MessageTask, MessageType, Participant, PreviewMessage, Recipient, RunningDinner } from '../../types';
import { FetchData, INITIAL_FETCH_DATA } from '../../redux';

export interface AdminState {
  runningDinner: FetchData<RunningDinner>;
}

export interface ParticipantsState {
  participants: FetchData<Participant[]>;
}

export interface MessagesState {
  adminId: string;

  recipients: FetchData<Recipient[]>;
  previousRecipientSelection: string;
  customSelectedRecipients?: Recipient[];
  showCustomSelectionDialog: boolean;

  messageType: MessageType;
  messageObject: BaseMessage;

  selectedRecipientForPreview: Recipient | undefined;
  previewLoading: boolean;
  previewMessages: PreviewMessage[];
  isMailMessageValid: boolean;
  previewIssues: BackendIssue[];
}

export interface MessageJobDetailsState {
  messageTasks: FetchData<MessageTask[]>;
  messageJob: FetchData<MessageJob>;
}

export function newInitialAdminState(): AdminState {
  return {
    runningDinner: INITIAL_FETCH_DATA,
  };
}

export const newInitialMessagesState: MessagesState = {
  adminId: '',

  recipients: INITIAL_FETCH_DATA,
  previousRecipientSelection: CONSTANTS.RECIPIENT_SELECTION_COMMON.ALL,
  customSelectedRecipients: [],
  showCustomSelectionDialog: false,

  messageType: MessageType.MESSAGE_TYPE_PARTICIPANTS, // Will be overridden
  messageObject: getExampleParticipantMessage(), // Will be overridden

  selectedRecipientForPreview: undefined,
  previewLoading: false,
  previewMessages: [],
  isMailMessageValid: false,
  previewIssues: [],
};

export const newInitialMessageJobDetailsState: MessageJobDetailsState = {
  messageTasks: INITIAL_FETCH_DATA,
  messageJob: INITIAL_FETCH_DATA,
};
