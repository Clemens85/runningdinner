package org.runningdinner.payment;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.payment.paymentoptions.PaymentOptions;
import org.runningdinner.payment.paymentoptions.PaymentOptionsService;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ApplicationTest
public class PaymentOptionsServiceTest {
  
  @Autowired
  private TestHelperService testHelperService;
  
  @Autowired
  private PaymentOptionsService paymentOptionsService;

  private RunningDinner runningDinner;

  private String adminId;
  
  @Before
  public void setUp() {

    runningDinner = testHelperService.createPublicRunningDinner(LocalDate.now().plusDays(30), 2);
    adminId = runningDinner.getAdminId();
  }
  
  @Test
  public void findPaymentOptionsforNonExistingPaymentOptions() {
    assertThat(paymentOptionsService.findPaymentOptionsByAdminId(adminId)).isEmpty();
  }
  
  @Test
  public void createPaymentOptions() {
    
    PaymentOptions paymentOptions = paymentOptionsService.createPaymentOptions(adminId, PaymentTestUtil.newDefaultPaymentOptions(runningDinner));
    assertThat(paymentOptions.getBrandName()).isEqualTo(PaymentTestUtil.BRAND_NAME);
    assertThat(paymentOptions.getPricePerRegistration()).isEqualByComparingTo(PaymentTestUtil.PRICE_PER_REGISTRATION);
    
    assertThat(paymentOptionsService.findPaymentOptionsByAdminId(adminId)).isPresent();    
  }
  
  @Test
  public void updatePaymentOptions() {
    
    paymentOptionsService.createPaymentOptions(adminId, PaymentTestUtil.newDefaultPaymentOptions(runningDinner));
    
    PaymentOptions existingPaymentOptions = paymentOptionsService.findPaymentOptionsByAdminId(adminId).get();
    
    PaymentOptions paymentOptionsUpdate = PaymentTestUtil.newDefaultPaymentOptions(runningDinner);
    paymentOptionsUpdate.setPricePerRegistration(BigDecimal.ONE);
    paymentOptionsUpdate.setBrandName("Foo");
    paymentOptionsService.updatePaymentOptions(adminId, existingPaymentOptions.getId(), paymentOptionsUpdate);
    
    PaymentOptions paymentOptionsAfterUpdate = paymentOptionsService.findPaymentOptionsByAdminId(adminId).get();
    assertThat(paymentOptionsAfterUpdate.getBrandName()).isEqualTo("Foo");
    assertThat(paymentOptionsAfterUpdate.getPricePerRegistration()).isEqualByComparingTo("1");
  }
  
  @Test
  public void deletePaymentOptions() {
    UUID paymentOptionsId = paymentOptionsService.createPaymentOptions(adminId, PaymentTestUtil.newDefaultPaymentOptions(runningDinner)).getId();
    paymentOptionsService.deletePaymentOptions(adminId, paymentOptionsId);
    assertThat(paymentOptionsService.findPaymentOptionsByAdminId(adminId)).isEmpty();
  }

}
