package org.runningdinner.payment.paymentoptions;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import javax.transaction.Transactional;

import org.apache.commons.collections4.CollectionUtils;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.core.RunningDinner;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

@Service
public class PaymentOptionsService {

  private PaymentOptionsRepository paymentOptionsRepository;
  
  private RunningDinnerService runningDinnerService;
  
  public PaymentOptionsService(PaymentOptionsRepository paymentOptionsRepository, RunningDinnerService runningDinnerService) {
    this.paymentOptionsRepository = paymentOptionsRepository;
    this.runningDinnerService = runningDinnerService;
  }

  @Transactional
  public PaymentOptions createPaymentOptions(@ValidateAdminId String adminId, PaymentOptions incomingPaymentOptions) {
    
    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    
    Assert.state(!findPaymentOptionsByAdminId(adminId).isPresent(), "Cannot create paymentOptions when one already exists! " + adminId);
    
    PaymentOptions paymentOptions = new PaymentOptions(incomingPaymentOptions.getPricePerRegistration(), incomingPaymentOptions.getBrandName(), runningDinner);
    return paymentOptionsRepository.save(paymentOptions);
  }
  
  @Transactional
  public PaymentOptions updatePaymentOptions(@ValidateAdminId String adminId, UUID paymentOptionsId, PaymentOptions incomingPaymentOptions) {
   
    PaymentOptions paymentOptions = paymentOptionsRepository.findByIdAndAdminId(paymentOptionsId, adminId);
    Assert.notNull(paymentOptions, "Expected paymentOptions to exist for " + paymentOptionsId + " in " + adminId);

    paymentOptions.setPricePerRegistration(incomingPaymentOptions.getPricePerRegistration());
    paymentOptions.setBrandName(incomingPaymentOptions.getBrandName());
    return paymentOptionsRepository.save(paymentOptions);
  }
  
  @Transactional
  public void deletePaymentOptions(@ValidateAdminId String adminId, UUID paymentOptionsId) {

    PaymentOptions paymentOptions = paymentOptionsRepository.findByIdAndAdminId(paymentOptionsId, adminId);
    if (paymentOptions != null) {
      paymentOptionsRepository.delete(paymentOptions);
    }
  }
  
  public Optional<PaymentOptions> findPaymentOptionsByAdminId(@ValidateAdminId String adminId) {
    List<PaymentOptions> result = paymentOptionsRepository.findByAdminId(adminId);
    if (CollectionUtils.isEmpty(result)) {
      return Optional.empty();
    }
    return Optional.of(result.get(0));
  }
  
}
