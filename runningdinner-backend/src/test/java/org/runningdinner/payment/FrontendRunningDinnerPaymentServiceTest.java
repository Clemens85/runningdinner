package org.runningdinner.payment;

import org.awaitility.Awaitility;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.payment.paypal.PaypalConfig;
import org.payment.paypal.PaypalOrderStatus;
import org.runningdinner.common.Issue;
import org.runningdinner.common.IssueKeys;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.core.Gender;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.frontend.FrontendRunningDinnerPaymentService;
import org.runningdinner.frontend.RegistrationSummary;
import org.runningdinner.frontend.rest.RegistrationDataTO;
import org.runningdinner.initialization.CreateRunningDinnerInitializationService;
import org.runningdinner.mail.MailSenderFactory;
import org.runningdinner.mail.mock.MailSenderMockInMemory;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantAddress;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.payment.paymentoptions.PaymentOptionsService;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.runningdinner.test.util.TestUtil;
import org.runningdinner.wiremock.WireMockControlService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.LocalDate;
import java.util.Locale;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@ApplicationTest
@Disabled("PayPal not in use, hence we don't need this test for now. Need to fix wiremock anyway to get it running again")
public class FrontendRunningDinnerPaymentServiceTest {

  private static final Logger LOGGER = LoggerFactory.getLogger(FrontendRunningDinnerPaymentServiceTest.class);
  
  @Autowired
  private TestHelperService testHelperService;
  
  @Autowired
  private PaymentOptionsService paymentOptionsService;
  
  @Autowired
  private FrontendRunningDinnerPaymentService frontendRunningDinnerPaymentService;

  @Autowired
  private PaypalConfig paypalConfig;
  
  @Autowired
  private PaypalPaymentService paypalPaymentService;
  
  @Autowired
  private ParticipantService participantService;
  
  @Autowired
  private MailSenderFactory mailSenderFactory;

  //  @Autowired
//  private WireMockControlService wireMockControlService;
  
  private MailSenderMockInMemory mailSenderInMemory;
  
  private RunningDinner runningDinner;

  private String publicDinnerId;
  private String adminId;
  
  @BeforeEach
  public void setUp() {

    runningDinner = testHelperService.createPublicRunningDinner(LocalDate.now().plusDays(30), 2);
    publicDinnerId = runningDinner.getPublicSettings().getPublicId();
    adminId = runningDinner.getAdminId();

    this.mailSenderInMemory = testHelperService.getMockedMailSender();
    this.mailSenderInMemory.setUp();
    this.mailSenderInMemory.addIgnoreRecipientEmail(CreateRunningDinnerInitializationService.DEFAULT_DINNER_CREATION_ADDRESS);
    
    
    WireMockControlService.getRunningServer().resetToDefaultMappings();
    
    PaypalMock
    .newInstance(paypalConfig, WireMockControlService.getRunningServer())
    .mockAccessTokenRequest("secret-value")
    .mockCreateOrderRequest("123456")
    .mockGetOrderRequest("123456", PaypalOrderStatus.APPROVED)
    .mockCaptureOrderRequest("123456", "participant@payer.de");
    
  }
  
  @BeforeAll
  public static void beforeClass() {
    WireMockControlService.startServer();
  }
  
  @AfterAll
  public static void afterClass() {
    WireMockControlService.stopServer();
  }
  
  @Test
  public void registrationNotPossibleWithoutPayment() {

    RegistrationDataTO registrationData = TestUtil.createRegistrationData("Max Mustermann", "max@muster.de", 
        ParticipantAddress.parseFromCommaSeparatedString("Musterstraße 1, 47111 Musterstadt"), 6);

    // Without payment a registration should work...
    RegistrationSummary result = frontendRunningDinnerPaymentService.performFreeRegistration(publicDinnerId, registrationData);
    assertThat(result).isNotNull();
    
    // ... But with payment not:
    paymentOptionsService.createPaymentOptions(adminId, PaymentTestUtil.newDefaultPaymentOptions(runningDinner));
    registrationData.setEmail("foo@bar.de"); // Circumvent duplicated Email
    try {
      frontendRunningDinnerPaymentService.performFreeRegistration(publicDinnerId, registrationData);
      Assertions.fail("Registration should not be possible when we have paymentOptions but no succeeded order");
    } catch (ValidationException e) {
      assertThat(e.getIssues().getIssues()).hasSize(1);
      Issue issue = e.getIssues().getIssues().get(0);
      assertThat(issue.getMessage()).isEqualTo(IssueKeys.REGISTRATION_NOT_POSSIBLE_WITHOUT_PAYMENT);
    }
  }
  
  @Test
  public void registrationOrder_Create_Find_Cancel() {

    LOGGER.info("Starting test registrationOrder_Create_Find_Cancel");
    
    addPaymentOptions();

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
    assertRegistrationData(registrationDataFromOrder);
    
    registrationDataFromOrder = frontendRunningDinnerPaymentService.cancelRegistrationOrder(publicDinnerId, "123456");
    assertRegistrationData(registrationDataFromOrder);
    
    registrationOrder = paypalPaymentService.findRegistrationOrder(adminId, "123456");
    assertThat(registrationOrder.getParticipantId()).isNull();
    assertThat(registrationOrder.getPaypalOrderStatus()).isEqualTo(PaypalOrderStatus.VOIDED);
  }
  
  @Test
  public void completePaymentFlow() {

    addPaymentOptions();

    RegistrationDataTO registrationData = TestUtil.createRegistrationData("Max Mustermann", "max@muster.de", 
        ParticipantAddress.parseFromCommaSeparatedString("Musterstraße 1, 47111 Musterstadt"), 6);
    
    RegistrationOrder registrationOrder = frontendRunningDinnerPaymentService.createRegistrationOrder(publicDinnerId, registrationData);
    assertThat(registrationOrder).isNotNull();
    
    RegistrationSummary registrationSummary = frontendRunningDinnerPaymentService.performRegistrationForRegistrationOrder(publicDinnerId, "123456", Locale.GERMAN);
    assertThat(registrationSummary.getRegistrationPaymentSummary().getPricePerRegistration()).isEqualByComparingTo(PaymentTestUtil.PRICE_PER_REGISTRATION);
    assertThat(registrationSummary.getRegistrationPaymentSummary().getTotalPriceFormatted()).isEqualTo(PaymentTestUtil.PRICE_PER_REGISTRATION_FORMATTED);
    assertThat(registrationSummary.getRegistrationPaymentSummary().getBrandName()).isEqualTo(PaymentTestUtil.BRAND_NAME);
    
    registrationOrder = paypalPaymentService.findRegistrationOrder(adminId, "123456");
    assertThat(registrationOrder.getParticipantId()).isNotNull();
    assertThat(registrationOrder.getPaypalOrderStatus()).isEqualTo(PaypalOrderStatus.COMPLETED);
    assertThat(registrationOrder.getPayerEmail()).isEqualTo("participant@payer.de");
    
    // Ensure participant is automatically activated
    Participant participant = participantService.findParticipantById(adminId, registrationOrder.getParticipantId());
    assertThat(participant.getActivatedBy()).isEqualTo("max@muster.de");
    assertThat(participant.getActivationDate()).isNotNull();
    
    Awaitility
      .await()
      .atMost(3, TimeUnit.SECONDS)
      .untilAsserted(() -> assertThat(mailSenderInMemory.filterForMessageTo("max@muster.de")).isNotNull());
    SimpleMailMessage sentRegistrationMail = this.mailSenderInMemory.filterForMessageTo("max@muster.de");
    assertThat(sentRegistrationMail).isNotNull();
    assertThat(sentRegistrationMail.getSubject()).isEqualTo(PaymentTestUtil.BRAND_NAME + ": Deine Anmeldung");
    assertThat(sentRegistrationMail.getText()).doesNotContain("Link"); // No activation Lnik
  }

  @Test
  public void participantRegistrationMailWithoutPayment() {

    RegistrationDataTO registrationData = TestUtil.createRegistrationData("Max Mustermann", "max@muster.de", 
        ParticipantAddress.parseFromCommaSeparatedString("Musterstraße 1, 47111 Musterstadt"), 6);
    
    RegistrationSummary registrationSummary = frontendRunningDinnerPaymentService.performFreeRegistration(publicDinnerId, registrationData);
    assertThat(registrationSummary.getRegistrationPaymentSummary()).isNull();
    
    // Ensure participant is not automatically activated
    Participant participant = participantService.findParticipantById(adminId, registrationSummary.getParticipant().getId());
    assertThat(participant.getActivatedBy()).isNullOrEmpty();
    assertThat(participant.getActivationDate()).isNull();
    
    Awaitility
    .await()
    .atMost(3, TimeUnit.SECONDS)
    .untilAsserted(() -> assertThat(mailSenderInMemory.filterForMessageTo("max@muster.de")).isNotNull());
    
    SimpleMailMessage sentRegistrationMail = this.mailSenderInMemory.filterForMessageTo("max@muster.de");
    assertThat(sentRegistrationMail).isNotNull();
    assertThat(sentRegistrationMail.getSubject()).isEqualTo("runyourdinner: Bitte Anmeldung bestätigen");
    assertThat(sentRegistrationMail.getText()).contains("Link");
  }
  
  private void assertRegistrationData(RegistrationDataTO registrationDataFromOrder) {
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
  
  private void addPaymentOptions() {
    paymentOptionsService.createPaymentOptions(adminId, PaymentTestUtil.newDefaultPaymentOptions(runningDinner));
  }
}
