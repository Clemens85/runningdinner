package org.payment.paypal;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ClientTokenTO {
  
  @JsonProperty("client_token")
  private String clientToken;
  
  @JsonProperty("expires_in")
  private Long expiresIn;

  public String getClientToken() {
    return clientToken;
  }

  public void setClientToken(String clientToken) {
    this.clientToken = clientToken;
  }

  public Long getExpiresIn() {
    return expiresIn;
  }

  public void setExpiresIn(Long expiresIn) {
    this.expiresIn = expiresIn;
  }
  
}
