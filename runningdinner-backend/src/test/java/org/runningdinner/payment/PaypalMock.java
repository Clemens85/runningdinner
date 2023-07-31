package org.runningdinner.payment;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathMatching;

import org.payment.paypal.AccessTokenResponseTO;
import org.payment.paypal.PaypalCaptureResponseTO;
import org.payment.paypal.PaypalConfig;
import org.payment.paypal.PaypalOrderResponseTO;
import org.payment.paypal.PaypalOrderStatus;
import org.payment.paypal.PaypalPayerTO;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.tomakehurst.wiremock.WireMockServer;

public class PaypalMock {

  public static final int PORT = 22222;
  
  private PaypalConfig paypalConfig;
  
  private ObjectMapper objectMapper = new ObjectMapper();

  private WireMockServer wireMockServer;
  
  private PaypalMock(PaypalConfig paypalConfig, WireMockServer wireMockServer) {
    this.paypalConfig = paypalConfig;
    this.paypalConfig.setBaseUrl("http://localhost:" + PORT);
    this.wireMockServer = wireMockServer;
  }

  public static PaypalMock newInstance(PaypalConfig paypalConfig, WireMockServer wireMockServer) {
    return new PaypalMock(paypalConfig, wireMockServer);
  }
  
  
  public PaypalMock mockAccessTokenRequest(String mockedTokenValue) {
    AccessTokenResponseTO accessTokenResponse = new AccessTokenResponseTO();
    accessTokenResponse.setAccessToken(mockedTokenValue);
    accessTokenResponse.setScope("scope");
    accessTokenResponse.setApplicationId("AppId");
    String accessTokenResponseAsJsonStr = writeValueAsJsonString(accessTokenResponse); 
    
    wireMockServer.stubFor(post(urlPathMatching("/v1/oauth2/token"))
//        .withHeader("Accept", matching("application/json.*"))
//        .withHeader("Accept-Language", matching("en_US"))
//        .withHeader("Content-Type", matching("application/x-www-form-urlencoded"))
//        .withHeader("Authorization", matching("Basic *"))
        .willReturn(aResponse()
                      .withStatus(200)
                      .withBody(accessTokenResponseAsJsonStr)));
    return this;
  }
  
  public PaypalMock mockCreateOrderRequest(String mockedOrderIdValue) {
    
    PaypalOrderResponseTO orderResponse = new PaypalOrderResponseTO();
    orderResponse.setId(mockedOrderIdValue);
    orderResponse.setStatus(PaypalOrderStatus.CREATED);
    orderResponse.setLinks(PaymentTestUtil.newPaypalLinkList(mockedOrderIdValue));
    String orderResponseAsJsonStr = writeValueAsJsonString(orderResponse);
    
    wireMockServer.stubFor(post(urlPathMatching("/v2/checkout/orders"))
//        .withHeader("Accept", matching("application/json"))
//        .withHeader("Authorization", matching("Bearer secret-token"))
        .willReturn(aResponse()
                      .withStatus(200)
                      .withBody(orderResponseAsJsonStr)));
    
    return this;
  }
  

  public PaypalMock mockCaptureOrderRequest(String orderId, String mockedPayerEmailAddress) {
    
    PaypalCaptureResponseTO response = new PaypalCaptureResponseTO();
    response.setId(orderId);
    response.setStatus(PaypalOrderStatus.COMPLETED);
    response.setPayer(new PaypalPayerTO());
    response.getPayer().setEmailAddress(mockedPayerEmailAddress);
    response.getPayer().setId("PayerId");
    String responseJsonStr = writeValueAsJsonString(response);
    
    wireMockServer.stubFor(post(urlPathMatching("/v2/checkout/orders/" + orderId + "/capture"))
        .willReturn(aResponse()
                      .withStatus(200)
                      .withBody(responseJsonStr)));
    
    return this;
  }
  
  public PaypalMock mockGetOrderRequest(String orderId, PaypalOrderStatus mockedPaypalStatus) {
    
    PaypalOrderResponseTO response = new PaypalOrderResponseTO();
    response.setId(orderId);
    response.setStatus(mockedPaypalStatus);
    String responseJsonStr = writeValueAsJsonString(response);
    
    wireMockServer.stubFor(get(urlPathMatching("/v2/checkout/orders/" + orderId))
        .willReturn(aResponse()
                      .withStatus(200)
                      .withBody(responseJsonStr)));
    
    return this;
  }
  
  private String writeValueAsJsonString(Object value) {
    try {
      return objectMapper.writeValueAsString(value);
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
  }

}
