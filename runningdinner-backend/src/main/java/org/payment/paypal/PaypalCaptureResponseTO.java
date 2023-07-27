package org.payment.paypal;

public class PaypalCaptureResponseTO {

  private String id;

  private PaypalOrderStatus status;

  private PaypalPayerTO payer;

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public PaypalOrderStatus getStatus() {
    return status;
  }

  public void setStatus(PaypalOrderStatus status) {
    this.status = status;
  }

  public PaypalPayerTO getPayer() {
    return payer;
  }

  public void setPayer(PaypalPayerTO payer) {
    this.payer = payer;
  }

}
