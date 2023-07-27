package org.runningdinner.frontend;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import javax.transaction.Transactional;
import javax.validation.Valid;

import org.apache.commons.lang3.StringUtils;
import org.payment.paypal.PaypalOrderResponseTO;
import org.payment.paypal.PaypalOrderStatus;
import org.runningdinner.common.Issue;
import org.runningdinner.common.IssueKeys;
import org.runningdinner.common.IssueList;
import org.runningdinner.common.IssueType;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.frontend.rest.RegistrationDataTO;
import org.runningdinner.frontend.rest.RegistrationPaymentSummaryTO;
import org.runningdinner.frontend.rest.RunningDinnerPublicListTO;
import org.runningdinner.frontend.rest.RunningDinnerPublicTO;
import org.runningdinner.payment.PaypalPaymentService;
import org.runningdinner.payment.RegistrationDataMapper;
import org.runningdinner.payment.RegistrationOrder;
import org.runningdinner.payment.paymentoptions.PaymentOptions;
import org.runningdinner.payment.paymentoptions.PaymentOptionsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Service
public class FrontendRunningDinnerPaymentService {

  private PaymentOptionsService paymentOptionsService;
  
  private FrontendRunningDinnerService frontendRunningDinnerService;
  
  private PaypalPaymentService paypalPaymentService;
  
  public FrontendRunningDinnerPaymentService(PaymentOptionsService paymentOptionsService,
                                             FrontendRunningDinnerService frontendRunningDinnerService, 
                                             PaypalPaymentService paypalPaymentService) {
    this.paymentOptionsService = paymentOptionsService;
    this.frontendRunningDinnerService = frontendRunningDinnerService;
    this.paypalPaymentService = paypalPaymentService;
  }

  public RunningDinnerPublicTO mapToRunningDinnerPublicTO(RunningDinner runningDinner, LocalDate now) {
    PaymentOptions paymentOptions = paymentOptionsService.findPaymentOptionsByAdminId(runningDinner.getAdminId()).orElse(null);
    return new RunningDinnerPublicTO(runningDinner, paymentOptions, now);
  }
  
  public RunningDinnerPublicListTO mapToRunningDinnerPublicListTO(List<RunningDinner> publicRunningDinnerList, LocalDate now) {
    
    List<RunningDinnerPublicTO> mappedPublicRunningDinners = publicRunningDinnerList
                                                              .stream()
                                                              .map(r -> mapToRunningDinnerPublicTO(r,  now))
                                                              .collect(Collectors.toList());
    
    RunningDinnerPublicListTO result = new RunningDinnerPublicListTO();
    result.setPublicRunningDinners(mappedPublicRunningDinners);
    return result;
  }
  
  @Transactional
  public RegistrationSummary performFreeRegistration(String publicDinnerId, @Valid RegistrationDataTO registrationData, Locale locale) {
    RunningDinner runningDinner = frontendRunningDinnerService.findRunningDinnerByPublicId(publicDinnerId, LocalDate.now());
    PaymentOptions paymentOptions = paymentOptionsService.findPaymentOptionsByAdminId(runningDinner.getAdminId())
        .orElse(null);
    if (paymentOptions != null) {
      throw new ValidationException(new IssueList(new Issue(IssueKeys.REGISTRATION_NOT_POSSIBLE_WITHOUT_PAYMENT, IssueType.VALIDATION)));
    }
    RegistrationSummary result = frontendRunningDinnerService.performRegistration(publicDinnerId, registrationData, false);
    return result;
  }
  
  @Transactional
  public RegistrationSummary performRegistrationForRegistrationOrder(String publicDinnerId, String paypalOrderId) {
    
    RunningDinner runningDinner = frontendRunningDinnerService.findRunningDinnerByPublicId(publicDinnerId, LocalDate.now());
    
    final RegistrationDataTO registrationData = findRegistrationDataForPublicDinnerIdAndPaypalOrderId(publicDinnerId, paypalOrderId);
    
    PaypalOrderResponseTO paypalOrderResponse = paypalPaymentService.reloadPaypalOrder(runningDinner.getAdminId(), paypalOrderId);
    if (paypalOrderResponse.getStatus() != PaypalOrderStatus.APPROVED) {
      throw new ValidationException(new IssueList(new Issue(IssueKeys.REGISTRATION_NOT_POSSIBLE_WITHOUT_PAYMENT, IssueType.VALIDATION)));
    }
    
    final RegistrationSummary registrationSummary = frontendRunningDinnerService.performRegistration(publicDinnerId, registrationData, false);
    
    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
      @Override
      public void beforeCompletion() {
        paypalPaymentService.captureRegistrationOrder(runningDinner.getAdminId(), paypalOrderId, registrationSummary.getParticipant());
      }
    });
    
    return registrationSummary;
  }
  
  @Transactional
  public RegistrationDataTO cancelRegistrationOrder(String publicDinnerId, String paypalOrderId) {
    
    RunningDinner runningDinner = frontendRunningDinnerService.findRunningDinnerByPublicId(publicDinnerId, LocalDate.now());
    RegistrationOrder registrationOrder = paypalPaymentService.cancelRegistrationOrder(runningDinner.getAdminId(), paypalOrderId);
    return new RegistrationDataMapper().mapFromJson(registrationOrder.getRegistrationDataJsonStr());
  }
  
  public RegistrationSummary addRegistrationPaymentSummary(String publicDinnerId, RegistrationSummary registrationSummary, Locale locale) {
    RunningDinner runningDinner = frontendRunningDinnerService.findRunningDinnerByPublicId(publicDinnerId, LocalDate.now());
    PaymentOptions paymentOptions = paymentOptionsService.findPaymentOptionsByAdminId(runningDinner.getAdminId()).orElse(null);
    if (paymentOptions == null) {
      return registrationSummary;
    }
    
    boolean isTeamPartnerRegistration = registrationSummary.getTeamPartnerWishRegistrationData() != null && StringUtils.isNotBlank(registrationSummary.getTeamPartnerWishRegistrationData().getLastname());
    BigDecimal purchaseAmount = PaypalPaymentService.calculatePurchaseAmount(paymentOptions, isTeamPartnerRegistration);

    RegistrationPaymentSummaryTO paymentSummary = new RegistrationPaymentSummaryTO(paymentOptions);
    paymentSummary.setTotalPriceFormatted(PaypalPaymentService.getFormattedAmountValue(purchaseAmount, locale));
    paymentSummary.setTeamPartnerRegistration(isTeamPartnerRegistration);
    registrationSummary.setRegistrationPaymentSummary(paymentSummary);
    
    return registrationSummary;
  }
  
  @Transactional
  public RegistrationOrder createRegistrationOrder(String publicDinnerId, RegistrationDataTO registrationData) {
    RunningDinner runningDinner = frontendRunningDinnerService.findRunningDinnerByPublicId(publicDinnerId, LocalDate.now());
    RegistrationOrder result = paypalPaymentService.createRegistrationOrder(runningDinner, registrationData);
    return result;
  }
  
  public RegistrationDataTO findRegistrationDataForPublicDinnerIdAndPaypalOrderId(String publicDinnerId, String paypalOrderId) {
    RunningDinner runningDinner = frontendRunningDinnerService.findRunningDinnerByPublicId(publicDinnerId, LocalDate.now());
    RegistrationDataTO registrationData = paypalPaymentService.findRegistrationDataForOrderId(runningDinner.getAdminId(), paypalOrderId);
    return registrationData;
  }



}
