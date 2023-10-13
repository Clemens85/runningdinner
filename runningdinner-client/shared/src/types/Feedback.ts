export interface FeedbackData {
  message: string;
  senderEmail: string;
}

export interface Feedback extends FeedbackData {
  adminId?: string;
  pageName?: string;
}

export function newEmptyFeedbackInstance(): Feedback {
  return {
    message: "",
    senderEmail: ""
  };
}