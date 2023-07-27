package org.runningdinner.payment;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.post;
import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathMatching;
import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.payment.paypal.AccessTokenResponseTO;
import org.payment.paypal.LinkTO;
import org.payment.paypal.PaypalConfig;
import org.payment.paypal.PaypalOrderResponseTO;
import org.payment.paypal.PaypalOrderStatus;
import org.runningdinner.core.Gender;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.frontend.FrontendRunningDinnerPaymentService;
import org.runningdinner.frontend.FrontendRunningDinnerService;
import org.runningdinner.frontend.rest.RegistrationDataTO;
import org.runningdinner.participant.ParticipantAddress;
import org.runningdinner.payment.paymentoptions.PaymentOptions;
import org.runningdinner.payment.paymentoptions.PaymentOptionsService;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.runningdinner.test.util.TestUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.tomakehurst.wiremock.junit.WireMockRule;

@RunWith(SpringJUnit4ClassRunner.class)
@ApplicationTest
public class PaypalPaymentServiceTest {

  @Autowired
  private PaypalPaymentService paypalPaymentService;
  
  @Autowired
  private FrontendRunningDinnerService frontendRunningDinnerService;
  
  @Autowired
  private PaypalConfig paypalConfig;
  
  @Autowired
  private FrontendRunningDinnerPaymentService frontendRunningDinnerPaymentService;
  
  @Autowired
  private TestHelperService testHelperService;
  
  @Autowired
  private PaymentOptionsService paymentOptionsService;
  
  @Autowired
  private ObjectMapper objectMapper;
  
  @Rule
  public WireMockRule wireMockRule = new WireMockRule(22222);

  private RunningDinner runningDinner;

  private String publicDinnerId;
  private String adminId;
  
  @Before
  public void setUp() throws JsonProcessingException {

    runningDinner = testHelperService.createPublicRunningDinner(LocalDate.now().plusDays(30), 2);
    publicDinnerId = runningDinner.getPublicSettings().getPublicId();
    adminId = runningDinner.getAdminId();
    paymentOptionsService.createPaymentOptions(adminId, new PaymentOptions(BigDecimal.TEN, "Taste Night", runningDinner));
    paypalConfig.setBaseUrl("http://localhost:22222");
    addPaypalStubs();
  }
  
  @Test
  public void checkoutRegistrationAndEnsureRegistrationDataIsPersisted() {
    
    RegistrationDataTO registrationData = TestUtil.createRegistrationData("Max Mustermann", "max@muster.de", 
        ParticipantAddress.parseFromCommaSeparatedString("Musterstraße 1, 47111 Musterstadt"), 6);
    registrationData.setGender(Gender.MALE);
    registrationData.setMobileNumber("123456");
    registrationData.setNotes("Notes");
    registrationData.setVegetarian(true);
    
    RegistrationOrder registrationOrder = frontendRunningDinnerPaymentService.createRegistrationOrder(publicDinnerId, registrationData);
    assertThat(registrationOrder.getPaypalOrderStatus()).isEqualTo(PaypalOrderStatus.CREATED);
    assertThat(registrationOrder.getPaypalOrderId()).isNotEmpty();
    assertThat(registrationOrder.getAdminId()).isEqualTo(adminId);
    assertThat(registrationOrder.getRegistrationDataJsonStr()).isNotEmpty();
    
    assertThat(registrationOrder.getApproveLink().getMethod()).isEqualTo("GET");
    assertThat(registrationOrder.getApproveLink().getRel()).isEqualTo("approve");
    
    RegistrationDataTO registrationDataFromOrder = frontendRunningDinnerPaymentService.findRegistrationDataForPublicDinnerIdAndPaypalOrderId(publicDinnerId, registrationOrder.getPaypalOrderId());
    assertThat(registrationDataFromOrder.getEmail()).isEqualTo("max@muster.de");
    assertThat(registrationDataFromOrder.getAgeNormalized()).isEqualTo(-1);
    assertThat(registrationDataFromOrder.getCityName()).isEqualTo("Musterstadt");
    assertThat(registrationDataFromOrder.getFirstnamePart()).isEqualTo("Max");
    assertThat(registrationDataFromOrder.getGender()).isEqualTo(Gender.MALE);
    assertThat(registrationDataFromOrder.getLastname()).isEqualTo("Mustermann");
    assertThat(registrationDataFromOrder.getMobileNumber()).isEqualTo("123456");
    assertThat(registrationDataFromOrder.getNotes()).isEqualTo("Notes");
    assertThat(registrationDataFromOrder.getNumSeats()).isEqualTo(6);
    assertThat(registrationDataFromOrder.getStreet()).isEqualTo("Musterstraße");
    assertThat(registrationDataFromOrder.getStreetNr()).isEqualTo("1");
    assertThat(registrationDataFromOrder.getZip()).isEqualTo("47111");
    assertThat(registrationDataFromOrder.isVegetarian()).isTrue();
    assertThat(registrationDataFromOrder.isVegan()).isFalse();
  }
  
  @Test
  public void completePaymentFlow() {
  
    RegistrationDataTO registrationData = TestUtil.createRegistrationData("Max Mustermann", "max@muster.de", 
        ParticipantAddress.parseFromCommaSeparatedString("Musterstraße 1, 47111 Musterstadt"), 6);
    
    RegistrationOrder registrationOrder = frontendRunningDinnerPaymentService.createRegistrationOrder(publicDinnerId, registrationData);
  }
  
  void addPaypalStubs() throws JsonProcessingException {
    
    AccessTokenResponseTO accessTokenResponse = new AccessTokenResponseTO();
    accessTokenResponse.setAccessToken("secret-token");
    accessTokenResponse.setScope("scope");
    accessTokenResponse.setApplicationId("AppId");
    String accessTokenResponseAsJsonStr = objectMapper.writeValueAsString(accessTokenResponse);
    
    stubFor(post(urlPathMatching("/v1/oauth2/token"))
//        .withHeader("Accept", matching("application/json.*"))
//        .withHeader("Accept-Language", matching("en_US"))
//        .withHeader("Content-Type", matching("application/x-www-form-urlencoded"))
//        .withHeader("Authorization", matching("Basic *"))
        .willReturn(aResponse()
                      .withStatus(200)
                      .withBody(accessTokenResponseAsJsonStr)));

    PaypalOrderResponseTO orderResponse = new PaypalOrderResponseTO();
    orderResponse.setId("MockOrderId");
    orderResponse.setStatus(PaypalOrderStatus.CREATED);
    orderResponse.setLinks(newPaypalLinkList());
    String orderResponseAsJsonStr = objectMapper.writeValueAsString(orderResponse);
    
    stubFor(post(urlPathMatching("/v2/checkout/orders"))
//        .withHeader("Accept", matching("application/json"))
//        .withHeader("Authorization", matching("Bearer secret-token"))
        .willReturn(aResponse()
                      .withStatus(200)
                      .withBody(orderResponseAsJsonStr)));
  }

  private List<LinkTO> newPaypalLinkList() {
    List<LinkTO> result = new ArrayList<>();
    result.add(newSelfLink());
    result.add(newApproveLink());
    return result;
  }
  
  private LinkTO newSelfLink() {
    LinkTO result = new LinkTO();
    result.setRel("self");
    result.setHref("http://localhost:22222/v2/checkout/orders/XXX");
    result.setMethod("GET");
    return result;
  }
  
  private LinkTO newApproveLink() {
    LinkTO result = new LinkTO();
    result.setRel("approve");
    result.setHref("http://localhost:22222/checkoutnow?token=XXX");
    result.setMethod("GET");
    return result;
  }
}
