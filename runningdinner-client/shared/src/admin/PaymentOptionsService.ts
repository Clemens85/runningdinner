import axios from 'axios';
import { PaymentOptions } from '../types';
import { BackendConfig } from '../BackendConfig';
import { isNewEntity } from '../Utils';

export async function findPaymentOptionsAsync(adminId: string): Promise<PaymentOptions | undefined> {
  const url = BackendConfig.buildUrl(`/paymentoptionsservice/v1/runningdinner/${adminId}`);
  const response = await axios.get(url);
  return response.data;
}

export async function createOrUpdatePaymentOptionsAsync(adminId: string, paymentOptions: PaymentOptions): Promise<PaymentOptions> {
  let url = BackendConfig.buildUrl(`/paymentoptionsservice/v1/runningdinner/${adminId}`);
  if (isNewEntity(paymentOptions)) {
    const response = await axios.post(url, paymentOptions);
    return response.data;
  } else {
    url += `/${paymentOptions.id}`;
    const response = await axios.put(url, paymentOptions);
    return response.data;
  }
}

export async function deletePaymentOptionsAsync(adminId: string, paymentOptionsId: string): Promise<void> {
  const url = BackendConfig.buildUrl(`/paymentoptionsservice/v1/runningdinner/${adminId}/${paymentOptionsId}`);
  await axios.delete(url);
}
