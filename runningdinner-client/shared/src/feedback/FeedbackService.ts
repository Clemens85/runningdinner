import axios from 'axios';

import { newUuid } from '..';
import { BackendConfig } from '../BackendConfig';
import { Feedback } from '../types';

// const SUPPORT_BOT_API_URL = 'http://localhost:8000/api/support';
const SUPPORT_BOT_API_URL = `${import.meta.env.VITE_SUPPORT_BOT_API_URL}`;

export async function saveFeedbackAsync(feedback: Feedback): Promise<void> {
  const url = BackendConfig.buildUrl(`/feedbackservice/v1/feedback`);
  await axios.post<Feedback>(url, feedback);
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
  const response = await axios.post<Feedback>(SUPPORT_BOT_API_URL, userRequest, {
    timeout: 18000,
  });
  return {
    answer: response?.data?.answer || '',
    id: newUuid(),
  };
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
