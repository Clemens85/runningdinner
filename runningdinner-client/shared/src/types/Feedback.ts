import { newUuid } from '../Utils';

export interface FeedbackData {
  message: string;
  senderEmail: string;
  followUpMessage?: string;
}

export interface Feedback extends FeedbackData {
  adminId?: string;
  pageName?: string;
  threadId?: string;
  answer?: string;
}

export function newEmptyFeedbackInstance(): Feedback {
  return {
    message: '',
    senderEmail: '',
    threadId: newUuid(),
  };
}
