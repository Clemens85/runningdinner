import {
  ActivityList, BaseMessage,
  DashboardAdminActivities,
  getExampleParticipantMessage,
  HttpError,
  MessageJob,
  MessageType,
  Participant, PreviewMessage,
  Recipient,
  RunningDinner
} from "@runningdinner/shared";
import {FetchData, FetchStatus} from "../../redux";

const INITIAL_FETCH_DATA = {
  fetchStatus: FetchStatus.IDLE,
}

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
  recipientSelection: string;
  previousSelection: string;
  customSelectedRecipients?: Recipient[];
  showCustomSelectionDialog: boolean;

  messageType: MessageType;
  messageObject: BaseMessage;

  selectedRecipientForPreview: Recipient | undefined;
  previewLoading: boolean;
  previewMessages: PreviewMessage[];
  isMailMessageValid: boolean;

  messageJobs: FetchData<MessageJob[]>;
  lastPollDate: Date;
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
  recipientSelection: '',
  previousSelection: '',
  customSelectedRecipients: [],
  showCustomSelectionDialog: false,

  messageType: MessageType.MESSAGE_TYPE_PARTICIPANTS, // Will be overridden
  messageObject: getExampleParticipantMessage(), // Will be overridden

  selectedRecipientForPreview: undefined,
  previewLoading: false,
  previewMessages: [],
  isMailMessageValid: false,

  messageJobs: INITIAL_FETCH_DATA,
  lastPollDate: new Date()
};


