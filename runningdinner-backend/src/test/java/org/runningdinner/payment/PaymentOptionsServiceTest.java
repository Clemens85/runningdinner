package org.runningdinner.payment;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.runningdinner.common.Issue;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.frontend.FrontendRunningDinnerService;
import org.runningdinner.frontend.RegistrationSummary;
import org.runningdinner.frontend.rest.RegistrationDataTO;
import org.runningdinner.participant.ParticipantAddress;
import org.runningdinner.payment.paymentoptions.PaymentOptions;
import org.runningdinner.payment.paymentoptions.PaymentOptionsService;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.runningdinner.test.util.TestUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ApplicationTest
public class PaymentOptionsServiceTest {
  
  private static final String TASTE_NIGHT = "Taste Night";
  private static final BigDecimal PRICE_PER_REGISTRATION = new BigDecimal("8");

  @Autowired
  private FrontendRunningDinnerService frontendRunningDinnerService;
  
  @Autowired
  private TestHelperService testHelperService;
  
  @Autowired
  private PaymentOptionsService paymentOptionsService;

  private RunningDinner runningDinner;

  private String publicDinnerId;
  private String adminId;
  
  @Before
  public void setUp() {

    runningDinner = testHelperService.createPublicRunningDinner(LocalDate.now().plusDays(30), 2);
    publicDinnerId = runningDinner.getPublicSettings().getPublicId();
    adminId = runningDinner.getAdminId();
  }
  
  @Test
  public void findPaymentOptionsforNonExistingPaymentOptions() {
    assertThat(paymentOptionsService.findPaymentOptionsByAdminId(adminId)).isEmpty();
  }
  
  @Test
  public void createPaymentOptions() {
    
    PaymentOptions paymentOptions = paymentOptionsService.createPaymentOptions(adminId, newDefaultPaymentOptions());
    assertThat(paymentOptions.getBrandName()).isEqualTo(TASTE_NIGHT);
    assertThat(paymentOptions.getPricePerRegistration()).isEqualByComparingTo(PRICE_PER_REGISTRATION);
    
    assertThat(paymentOptionsService.findPaymentOptionsByAdminId(adminId)).isPresent();    
  }
  
  @Test
  public void updatePaymentOptions() {
    
    paymentOptionsService.createPaymentOptions(adminId, newDefaultPaymentOptions());
    
    PaymentOptions existingPaymentOptions = paymentOptionsService.findPaymentOptionsByAdminId(adminId).get();
    
    PaymentOptions paymentOptionsUpdate = newDefaultPaymentOptions();
    paymentOptionsUpdate.setPricePerRegistration(BigDecimal.ONE);
    paymentOptionsUpdate.setBrandName("Foo");
    paymentOptionsService.updatePaymentOptions(adminId, existingPaymentOptions.getId(), paymentOptionsUpdate);
    
    PaymentOptions paymentOptionsAfterUpdate = paymentOptionsService.findPaymentOptionsByAdminId(adminId).get();
    assertThat(paymentOptionsAfterUpdate.getBrandName()).isEqualTo("Foo");
    assertThat(paymentOptionsAfterUpdate.getPricePerRegistration()).isEqualByComparingTo("1");
  }
  
  @Test
  public void deletePaymentOptions() {
    UUID paymentOptionsId = paymentOptionsService.createPaymentOptions(adminId, newDefaultPaymentOptions()).getId();
    paymentOptionsService.deletePaymentOptions(adminId, paymentOptionsId);
    assertThat(paymentOptionsService.findPaymentOptionsByAdminId(adminId)).isEmpty();
  }

  @Test
  public void registrationNotPossibleWithoutPayment() {

    paymentOptionsService.createPaymentOptions(adminId, newDefaultPaymentOptions());

    RegistrationDataTO registrationData = TestUtil.createRegistrationData("Max Mustermann", "max@muster.de", 
        ParticipantAddress.parseFromCommaSeparatedString("Musterstraße 1, 47111 Musterstadt"), 6);

    // Preview should work...
    RegistrationSummary result = frontendRunningDinnerService.performRegistration(publicDinnerId, registrationData, true);
    assertThat(result).isNotNull();
    
    // ... But registration not:
    try {
      frontendRunningDinnerService.performRegistration(publicDinnerId, registrationData, false);
      Assert.fail("Registration should not be possible when we have paymentOptions but no succeeded order");
    } catch (ValidationException e) {
      assertThat(e.getIssues().getIssues()).hasSize(1);
      Issue issue = e.getIssues().getIssues().get(0);
      // TODO
    }
  }
  
  private PaymentOptions newDefaultPaymentOptions() {
    return new PaymentOptions(PRICE_PER_REGISTRATION, TASTE_NIGHT, runningDinner);
  }
  
  
}
