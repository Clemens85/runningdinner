import { BackendConfig } from '../BackendConfig';
import { Feedback } from '../types';
import axios from 'axios';

export async function saveFeedbackAsync(feedback: Feedback): Promise<void> {
  const url = BackendConfig.buildUrl(`/feedbackservice/v1/feedback`);
  await axios.post<Feedback>(url, feedback);
}
