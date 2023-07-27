package org.runningdinner.frontend.rest;

import org.payment.paypal.PaypalOrderStatus;
import org.runningdinner.payment.RegistrationOrder;
import org.runningdinner.payment.RegistrationOrderLink;

public class RegistrationOrderTO {

  private String paypalOrderId;

  private PaypalOrderStatus paypalOrderStatus;
  
  private RegistrationOrderLink approveLink;
  
  private String payerEmail;

  private String payerFullname;
  
  protected RegistrationOrderTO() {
    // NOP
  }
  
  public RegistrationOrderTO(RegistrationOrder registrationOrder) {
    this.paypalOrderId = registrationOrder.getPaypalOrderId();
    this.paypalOrderStatus = registrationOrder.getPaypalOrderStatus();
    this.approveLink = registrationOrder.getApproveLink(); // Not quite clean, but okay due to a link contains only immutable Strings
    this.payerEmail = registrationOrder.getPayerEmail();
    this.payerFullname = registrationOrder.getPayerFullname();
  }

  public String getPaypalOrderId() {
    return paypalOrderId;
  }

  public void setPaypalOrderId(String paypalOrderId) {
    this.paypalOrderId = paypalOrderId;
  }

  public PaypalOrderStatus getPaypalOrderStatus() {
    return paypalOrderStatus;
  }

  public void setPaypalOrderStatus(PaypalOrderStatus paypalOrderStatus) {
    this.paypalOrderStatus = paypalOrderStatus;
  }

  public RegistrationOrderLink getApproveLink() {
    return approveLink;
  }

  public void setApproveLink(RegistrationOrderLink approveLink) {
    this.approveLink = approveLink;
  }

  public String getPayerEmail() {
    return payerEmail;
  }

  public void setPayerEmail(String payerEmail) {
    this.payerEmail = payerEmail;
  }

  public String getPayerFullname() {
    return payerFullname;
  }

  public void setPayerFullname(String payerFullname) {
    this.payerFullname = payerFullname;
  }
  
}
