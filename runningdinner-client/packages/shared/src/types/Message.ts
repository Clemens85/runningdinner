import {FuzzyBoolean, RunningDinnerRelated} from "./Base";
import { Participant } from "./Participant";
import { Team } from "./Team";

export enum MessageType {
  MESSAGE_TYPE_PARTICIPANTS = "PARTICIPANT",
  MESSAGE_TYPE_TEAMS = "TEAM",
  MESSAGE_TYPE_DINNERROUTE = "DINNER_ROUTE"
}

export enum MessageSubType {
  TEAM_SINGLE = "TEAM_SINGLE",
  TEAM_CANCELLATION = "TEAM_CANCELLATION",
  DEFAULT = "DEFAULT",
  RECIPIENTS_ALL = "RECIPIENTS_ALL"
}

export enum MessageParticipantsType {
  ALL = "ALL",
  DEFAULT = "DEFAULT"
}

export enum SendingStatus {
  QUEUED = "QUEUED",
  SENDING_STARTED = "SENDING_STARTED",
  SENDING_FINISHED = "SENDING_FINISHED"
}

export interface Sendable extends RunningDinnerRelated {
  sendingStatus: SendingStatus;
}
export interface MessageJob extends Sendable {
  messageType: MessageType;
  sendingFailed: FuzzyBoolean;
  jobExecutionId: number;
  numberOfMessageTasks: number;
}

export interface MessageTask extends Sendable {
  parentJobId: string
  recipientEmail: string;
  sendingStartTime: Date;
  sendingEndTime: Date;
  sendingResult: SendingResult;
  message: Message;
}

export interface MessageJobOverview extends RunningDinnerRelated {
  messageJobId: string;
  numMessagesSucceeded: number;
  numMessagesFailed: number;
  sendingFinished: boolean;
}

export interface SendingResult {
  delieveryFailed: boolean;
  failureMessage: string;
  failureType: string;
  delieveryFailedDate: Date;
}

export interface Message {
  subject: string;
  content: string;
  replyTo: string;
}

export interface PreviewMessage {
  participantId: string;
  message: string;
}

export interface PreviewMessageList {
  subject: string;
  previewMessageList: PreviewMessage[];
}

export enum TeamSelection {
  ALL = "ALL",
  CUSTOM_SELECTION = "CUSTOM_SELECTION"
}

export enum ParticipantSelection {
  ALL = "ALL",
  CUSTOM_SELECTION = "CUSTOM_SELECTION",
  ASSIGNED_TO_TEAM = "ASSIGNED_TO_TEAM",
  NOT_ASSIGNED_TO_TEAM = "NOT_ASSIGNED_TO_TEAM"
}

export interface BaseMessage {
  subject: string;
  message: string;
}

export interface BaseTeamMessage extends BaseMessage {
  teamSelection?: TeamSelection;
  customSelectedTeamIds?: string[];
}

export interface ParticipantMessage extends BaseMessage {
  participantSelection?: ParticipantSelection;
  customSelectedParticipantIds?: string[];
}

export interface TeamMessage extends BaseTeamMessage {
  hostMessagePartTemplate: string;
  nonHostMessagePartTemplate: string;
}

export interface DinnerRouteMessage extends BaseTeamMessage {
  selfTemplate: string;
  hostsTemplate: string;
}

export type Recipient = Team | Participant;