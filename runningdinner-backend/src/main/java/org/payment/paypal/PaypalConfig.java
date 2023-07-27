package org.payment.paypal;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class PaypalConfig {

  @Value("${paypal.baseurl}")
  private String baseUrl;

  @Value("${paypal.clientid}")
  private String clientId;

  @Value("${paypal.secret}")
  private String secret;
 
  @Value("${paypal.connection.timeout:15000}")
  private int connectionTimeout;

  public String getBaseUrl() {
    return baseUrl;
  }

  public String getClientId() {
    return clientId;
  }

  public String getSecret() {
    return secret;
  }

  public void setBaseUrl(String baseUrl) {
    this.baseUrl = baseUrl;
  }

  public int getConnectionTimeout() {
    return connectionTimeout;
  }
}