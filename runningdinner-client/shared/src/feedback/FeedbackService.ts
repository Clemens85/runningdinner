import axios from 'axios';

import { newUuid } from '..';
import { BackendConfig } from '../BackendConfig';
import { ConversationRole, Feedback, FeedbackConversation, FuzzyBoolean } from '../types';

const SUPPORT_BOT_API_URL = `${import.meta.env.VITE_SUPPORT_BOT_API_URL}`;

export async function saveFeedbackAsync(feedback: Feedback): Promise<void> {
  const url = BackendConfig.buildUrl(`/feedbackservice/v1/feedback`);
  await axios.post<Feedback>(url, feedback);
}

export async function saveFeedbackConversationsAsync(feedbackConversations: FeedbackConversation[]): Promise<void> {
  const url = BackendConfig.buildUrl(`/feedbackservice/v1/feedback/conversations`);
  await axios.post<FeedbackConversation[]>(url, feedbackConversations);
}

export async function updateFeedbackResolvedStatus(threadId: string, resolved: FuzzyBoolean): Promise<void> {
  const url = BackendConfig.buildUrl(`/feedbackservice/v1/feedback/${threadId}/resolved/${resolved}`);
  await axios.put(url);
}

export type SupportBotQueryResponse = {
  answer: string;
  id: string;
};

export async function querySupportBot(threadId: string, question: string, requestContext: Record<string, string>): Promise<SupportBotQueryResponse> {
  const userRequest = {
    thread_id: threadId,
    question: question,
    request_params: requestContext as Record<string, string>,
  };
  const response = await axios.post<{ answer: string }>(SUPPORT_BOT_API_URL, userRequest, {
    timeout: 22000,
  });
  const result = {
    answer: response?.data?.answer || '',
    id: newUuid(),
  };

  // Fire and forget: Save conversation to backend
  const feedbackConversations: FeedbackConversation[] = [
    { message: question, role: ConversationRole.HUMAN, threadId },
    { message: result.answer, role: ConversationRole.ASSISTANT, threadId },
  ];
  saveFeedbackConversationsAsync(feedbackConversations).catch((error) => {
    console.error('Failed to save feedback conversations:', error);
  });

  return result;
}

export async function querySupportBotFromFeedback(feedback: Feedback, question: string, publicEventRegistrations: string[]): Promise<SupportBotQueryResponse> {
  const requestContext = {
    page_name: feedback.pageName || '',
    admin_id: feedback.adminId || '',
    public_event_registrations: publicEventRegistrations.join(','),
  };
  return querySupportBot(feedback.threadId || '', question, requestContext);
}

export async function warmupSupportBot(): Promise<void> {
  let url = SUPPORT_BOT_API_URL;
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  try {
    await axios.get(`${url}/warmup`);
  } catch (error) {
    // Ignore errors during warmup
    console.error('Error during support bot warmup:', error);
  }
}
