package org.payment.paypal;

import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

import org.apache.http.HttpEntity;
import org.apache.http.HttpStatus;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.DefaultHttpRequestRetryHandler;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.conn.PoolingHttpClientConnectionManager;
import org.apache.http.util.EntityUtils;
import org.runningdinner.common.exception.TechnicalException;
import org.runningdinner.payment.RegistrationOrderLink;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class PaypalHttpClientApache {
  
  private static final Logger LOGGER = LoggerFactory.getLogger(PaypalHttpClientApache.class);
  
  private final CloseableHttpClient httpClient;
  
  private final PaypalConfig paypalConfig;
  
  private final ObjectMapper objectMapper;

  public PaypalHttpClientApache(PaypalConfig paypalConfig, ObjectMapper objectMapper) {
      this.paypalConfig = paypalConfig;
      this.objectMapper = objectMapper;
      this.httpClient = createHttpClient(); 

  }

  private CloseableHttpClient createHttpClient() {
    int connectionTimeout = paypalConfig.getConnectionTimeout();
    RequestConfig requestConfig = RequestConfig.custom()
                                    .setConnectionRequestTimeout(connectionTimeout)
                                    .setConnectTimeout(connectionTimeout)
                                    .setSocketTimeout(connectionTimeout)
                                    .setRedirectsEnabled(true)
                                    .build();
    PoolingHttpClientConnectionManager cm = new PoolingHttpClientConnectionManager();
    cm.setDefaultMaxPerRoute(10);
    cm.setMaxTotal(15);
    cm.setValidateAfterInactivity(500);
    return HttpClients.custom()
              .setRetryHandler(new DefaultHttpRequestRetryHandler(3, false))
              .setDefaultRequestConfig(requestConfig)
              .setConnectionManager(cm)
              .build();
  }

  public AccessTokenResponseTO getAccessToken() throws IOException, InterruptedException {
    
    HttpPost httpPost = new HttpPost(URI.create(PaypalEndpoints.createUrl(paypalConfig.getBaseUrl(), PaypalEndpoints.GET_ACCESS_TOKEN)));
    httpPost.setHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);
    httpPost.setHeader(HttpHeaders.AUTHORIZATION, encodeBasicCredentials());
    httpPost.setHeader(HttpHeaders.ACCEPT_LANGUAGE, "en_US");
    httpPost.setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_FORM_URLENCODED_VALUE);
    httpPost.setEntity(new StringEntity("grant_type=client_credentials"));
    
    LOGGER.info("Executing getAccessToken on {}", httpPost.getURI());
    
    try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
      checkSuccessStatus(response);
      HttpEntity responseBody = response.getEntity();
      String content = EntityUtils.toString(responseBody);
      return objectMapper.readValue(content, AccessTokenResponseTO.class);      
    }
  }

  public PaypalOrderResponseTO createOrder(PaypalOrderTO orderDTO) throws IOException, InterruptedException {
    AccessTokenResponseTO accessTokenDto = getAccessToken();
    String payload = objectMapper.writeValueAsString(orderDTO);

    HttpPost httpPost = new HttpPost(URI.create(PaypalEndpoints.createUrl(paypalConfig.getBaseUrl(), PaypalEndpoints.CREATE_ORDER)));
    httpPost.setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
    httpPost.setHeader(HttpHeaders.AUTHORIZATION, "Bearer " + accessTokenDto.getAccessToken());
    httpPost.setEntity(new StringEntity(payload));
    
    LOGGER.info("Executing createOrder on {}", httpPost.getURI());
    
    try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
      checkSuccessStatus(response);
      HttpEntity responseBody = response.getEntity();
      String content = EntityUtils.toString(responseBody);
      return objectMapper.readValue(content, PaypalOrderResponseTO.class);     
    }
  }
  
  public PaypalCaptureResponseTO captureOrder(String paypalOrderId) throws IOException, InterruptedException {
    AccessTokenResponseTO accessTokenDto = getAccessToken();
       
    HttpPost httpPost = new HttpPost(URI.create(PaypalEndpoints.createUrl(paypalConfig.getBaseUrl(), PaypalEndpoints.CAPTURE_ORDER, paypalOrderId)));
    httpPost.setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
    httpPost.setHeader(HttpHeaders.AUTHORIZATION, "Bearer " + accessTokenDto.getAccessToken());
    
    LOGGER.info("Executing captureOrder on {}", httpPost.getURI());
    
    try (CloseableHttpResponse response = httpClient.execute(httpPost)) {
      checkSuccessStatus(response);
      HttpEntity responseBody = response.getEntity();
      String content = EntityUtils.toString(responseBody);
      return objectMapper.readValue(content, PaypalCaptureResponseTO.class);  
    }
  }

  public PaypalOrderResponseTO getOrder(RegistrationOrderLink selfLink) throws IOException, InterruptedException {
    
    AccessTokenResponseTO accessTokenDto = getAccessToken();

    HttpGet httpGet = new HttpGet(URI.create(selfLink.getHref()));
    httpGet.setHeader(HttpHeaders.ACCEPT, MediaType.APPLICATION_JSON_VALUE);
    httpGet.setHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);
    httpGet.setHeader(HttpHeaders.AUTHORIZATION, "Bearer " + accessTokenDto.getAccessToken());
   
    LOGGER.info("Executing getOrder on {}", httpGet.getURI());
    
    try (CloseableHttpResponse response = httpClient.execute(httpGet)) {
      checkSuccessStatus(response);
      HttpEntity responseBody = response.getEntity();
      String content = EntityUtils.toString(responseBody);
      return objectMapper.readValue(content, PaypalOrderResponseTO.class);  
    }
  }
  
  private static void checkSuccessStatus(CloseableHttpResponse response) {
    int statusCode = response.getStatusLine().getStatusCode();
    if (statusCode < HttpStatus.SC_OK || statusCode > HttpStatus.SC_MULTI_STATUS) {
      String msg = "Statuscode of response was " + statusCode;
      throw new TechnicalException(msg);
    }
  }
  
  private String encodeBasicCredentials() {
    String input = paypalConfig.getClientId() + ":" + paypalConfig.getSecret();
    return "Basic " + Base64.getEncoder().encodeToString(input.getBytes(StandardCharsets.UTF_8));
  }

}
