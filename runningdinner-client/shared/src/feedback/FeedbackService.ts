import axios from 'axios';

import { BackendConfig } from '../BackendConfig';
import { Feedback } from '../types';

export async function saveFeedbackAsync(feedback: Feedback): Promise<void> {
  const url = BackendConfig.buildUrl(`/feedbackservice/v1/feedback`);
  await axios.post<Feedback>(url, feedback);
}
