import { Feedback, newUuid } from '@runningdinner/shared';

export type ChatMessage = {
  text: string;
  isAgentMessage?: boolean;
  pending?: boolean;
  id: string;
};

export function chatMessageFromFeedback(feedback: Feedback): ChatMessage {
  return {
    text: feedback.message,
    isAgentMessage: false,
    pending: false,
    id: feedback.threadId || newUuid(),
  };
}

export function filterNonPendingMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.filter((msg) => !msg.pending);
}

export function hasAtLeastOnePendingMessage(messages: ChatMessage[]): boolean {
  return messages.filter((msg) => msg.pending).length >= 1;
}
