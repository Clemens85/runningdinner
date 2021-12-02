import {CONSTANTS, getExampleParticipantMessage,} from "../..";
import {
  ActivityList,
  BackendIssue,
  BaseMessage,
  DashboardAdminActivities,
  MessageJob,
  MessageTask,
  MessageType,
  Participant,
  PreviewMessage,
  Recipient,
  RunningDinner,
} from "../../types";
import {FetchData, INITIAL_FETCH_DATA} from "../../redux";

export interface AdminState {
  runningDinner: FetchData<RunningDinner>;
}

export interface DashboardState {
  adminActivities: FetchData<DashboardAdminActivities>,
  participantActivities: FetchData<ActivityList>
}

export interface ParticipantsState {
  participants: FetchData<Participant[]>
}

export interface MessagesState {
  adminId: string;

  recipients: FetchData<Recipient[]>;
  // recipientSelection: string;
  // previousSelection: string;
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

  messageJobs: FetchData<MessageJob[]>;
  lastPollDate: Date;
}

export interface MessageJobDetailsState {
  messageTasks: FetchData<MessageTask[]>;
  messageJob: FetchData<MessageJob>;
}

export function newInitialAdminState(): AdminState {
  return {
    runningDinner: INITIAL_FETCH_DATA
  }
}

export function newInitialDashboardState(): DashboardState {
  return {
    adminActivities: INITIAL_FETCH_DATA,
    participantActivities: INITIAL_FETCH_DATA
  }
}

export const newInitialMessagesState : MessagesState = {
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

  messageJobs: INITIAL_FETCH_DATA,
  lastPollDate: new Date()
};

export const newInitialMessageJobDetailsState: MessageJobDetailsState = {
  messageTasks: INITIAL_FETCH_DATA,
  messageJob: INITIAL_FETCH_DATA
};

