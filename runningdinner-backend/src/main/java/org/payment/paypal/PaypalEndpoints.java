package org.payment.paypal;

public enum PaypalEndpoints {
  GET_ACCESS_TOKEN("/v1/oauth2/token"),
//  GET_CLIENT_TOKEN("/v1/identity/generate-token"),
  CAPTURE_ORDER("/v2/checkout/orders/%s/capture"),
  CREATE_ORDER("/v2/checkout/orders"),
  GET_ORDER("/v2/checkout/orders/%s");

  private final String path;

  PaypalEndpoints(String path) {
      this.path = path;
  }

  public static String createUrl(String baseUrl, PaypalEndpoints endpoint) {
      return baseUrl + endpoint.path;
  }

  public static String createUrl(String baseUrl, PaypalEndpoints endpoint, Object... params) {
      return baseUrl + String.format(endpoint.path, params);
  }

}
