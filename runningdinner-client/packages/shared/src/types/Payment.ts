export interface RegistrationOrder {
  paypalOrderId: string;
  paypalOrderStatus: string;
  approveLink: RegistrationOrderLink;
}

export interface RegistrationOrderLink {
  href: string;
  rel: string;
  method: string;
}

export interface PaymentOptions {
  id?: string;
  brandName: string;
  pricePerRegistration: number;
}

export function newEmptyPaymentOptions(): PaymentOptions {
  return {
    brandName: "",
    pricePerRegistration: 0.0
  };
}