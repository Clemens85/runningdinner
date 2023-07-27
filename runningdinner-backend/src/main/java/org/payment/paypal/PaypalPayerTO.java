package org.payment.paypal;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PaypalPayerTO {
  
  @JsonProperty("payer_id")
  private String id;

  @JsonProperty("email_address")
  private String emailAddress;
  
  private PaypalPayerNameTO name;

  public PaypalPayerNameTO getName() {
    return name;
  }

  public void setName(PaypalPayerNameTO name) {
    this.name = name;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getEmailAddress() {
    return emailAddress;
  }

  public void setEmailAddress(String emailAddress) {
    this.emailAddress = emailAddress;
  }
  
  
}
