//package org.payment.paypal;
//
//import java.io.IOException;
//import java.net.URI;
//import java.net.http.HttpClient;
//import java.net.http.HttpRequest;
//import java.net.http.HttpResponse;
//import java.nio.charset.StandardCharsets;
//import java.util.Base64;
//
//import org.springframework.http.HttpHeaders;
//import org.springframework.http.MediaType;
//import org.springframework.stereotype.Service;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//
//@Service
//public class PaypalHttpClientJava11 {
//  
//  private final HttpClient httpClient;
//  
//  private final PaypalConfig paypalConfig;
//  
//  private final ObjectMapper objectMapper;
//
//  public PaypalHttpClientJava11(PaypalConfig paypalConfig, ObjectMapper objectMapper) {
//      this.paypalConfig = paypalConfig;
//      this.objectMapper = objectMapper;
//      this.httpClient = HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).build();
//  }
//
//  public AccessTokenResponseTO getAccessToken() throws IOException, InterruptedException {
//    HttpRequest request = HttpRequest.newBuilder()
//            .uri(URI.create(PaypalEndpoints.createUrl(paypalConfig.getBaseUrl(), PaypalEndpoints.GET_ACCESS_TOKEN)))
//            .header(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE)
//            .header(HttpHeaders.AUTHORIZATION, encodeBasicCredentials())
//            .header(HttpHeaders.ACCEPT_LANGUAGE, "en_US")
//            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE)
//            .POST(HttpRequest.BodyPublishers.ofString("grant_type=client_credentials"))
//            .build();
//    HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
//    String content = response.body();
//    return objectMapper.readValue(content, AccessTokenResponseTO.class);
//  }
//
//  public ClientTokenTO getClientToken() throws Exception {
//    AccessTokenResponseTO accessTokenDto = getAccessToken();
//    HttpRequest request = HttpRequest.newBuilder()
//            .uri(URI.create(PaypalEndpoints.createUrl(paypalConfig.getBaseUrl(), PaypalEndpoints.GET_CLIENT_TOKEN)))
//            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
//            .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessTokenDto.getAccessToken())
//            .header(HttpHeaders.ACCEPT_LANGUAGE, "en_US")
//            .POST(HttpRequest.BodyPublishers.noBody())
//            .build();
//      HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
//      String content = response.body();
//      return objectMapper.readValue(content, ClientTokenTO.class);
//  }
//
//  public PaypalOrderResponseTO createOrder(PaypalOrderTO orderDTO) throws IOException, InterruptedException {
//    AccessTokenResponseTO accessTokenDto = getAccessToken();
//    String payload = objectMapper.writeValueAsString(orderDTO);
//
//    HttpRequest request = HttpRequest.newBuilder()
//            .uri(URI.create(PaypalEndpoints.createUrl(paypalConfig.getBaseUrl(), PaypalEndpoints.ORDER_CHECKOUT)))
//            .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
//            .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessTokenDto.getAccessToken())
//            .POST(HttpRequest.BodyPublishers.ofString(payload))
//            .build();
//    HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
//    String content = response.body();
//    return objectMapper.readValue(content, PaypalOrderResponseTO.class);
//  }
//
//  private String encodeBasicCredentials() {
//    String input = paypalConfig.getClientId() + ":" + paypalConfig.getSecret();
//    return "Basic " + Base64.getEncoder().encodeToString(input.getBytes(StandardCharsets.UTF_8));
//  }
//}
