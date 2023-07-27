package org.runningdinner.payment;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Locale;

import javax.transaction.Transactional;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.payment.paypal.LinkTO;
import org.payment.paypal.MoneyTO;
import org.payment.paypal.OrderIntent;
import org.payment.paypal.PayPalAppContextTO;
import org.payment.paypal.PaymentLandingPage;
import org.payment.paypal.PaypalCaptureResponseTO;
import org.payment.paypal.PaypalHttpClientApache;
import org.payment.paypal.PaypalOrderResponseTO;
import org.payment.paypal.PaypalOrderStatus;
import org.payment.paypal.PaypalOrderTO;
import org.payment.paypal.PaypalPayerTO;
import org.payment.paypal.PurchaseUnitTO;
import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.common.Issue;
import org.runningdinner.common.IssueType;
import org.runningdinner.common.exception.TechnicalException;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.common.service.ValidatorService;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.util.NumberUtil;
import org.runningdinner.frontend.FrontendRunningDinnerService;
import org.runningdinner.frontend.rest.RegistrationDataTO;
import org.runningdinner.participant.Participant;
import org.runningdinner.payment.paymentoptions.PaymentOptions;
import org.runningdinner.payment.paymentoptions.PaymentOptionsService;
import org.springframework.stereotype.Service;

@Service
public class PaypalPaymentService {

  public static final String CALLBACK_URL_TYPE_RETURN = "RETURN";
  public static final String CALLBACK_URL_TYPE_CANCEL = "CANCEL";
  
  public static final String LINK_REL_APPROVE = "approve";
  public static final CharSequence LINK_REL_SELF = "self";
  public static final CharSequence LINK_REL_UPDATE = "update";
  
  private static final String EUR = "EUR";

  private RegistrationOrderRepository registrationOrderRepository;
  
  private PaypalHttpClientApache paypalHttpClient;

  private PaymentOptionsService paymentOptionsService;

  private UrlGenerator urlGenerator;
  
  private ValidatorService validatorService;
  
  private RegistrationDataMapper registrationDataMapper = new RegistrationDataMapper();
  
  public PaypalPaymentService(RegistrationOrderRepository registrationOrderRepository, 
                              PaypalHttpClientApache paypalHttpClient, 
                              PaymentOptionsService paymentOptionsService,
                              UrlGenerator urlGenerator,
                              FrontendRunningDinnerService frontendRunningDinnerService,
                              ValidatorService validatorService) {
    this.registrationOrderRepository = registrationOrderRepository;
    this.paypalHttpClient = paypalHttpClient;
    this.paymentOptionsService = paymentOptionsService;
    this.urlGenerator = urlGenerator;
    this.validatorService = validatorService;
  }

  @Transactional
  public RegistrationOrder createRegistrationOrder(RunningDinner runningDinner, RegistrationDataTO registrationData) {
    
    PaymentOptions paymentOptions = paymentOptionsService.findPaymentOptionsByAdminId(runningDinner.getAdminId())
                                        .orElseThrow(() -> new IllegalStateException("Cannot create registration order for dinner without payment options (" + runningDinner + ")"));
    
    PayPalAppContextTO paypalAppContext = new PayPalAppContextTO();
    paypalAppContext.setBrandName(paymentOptions.getBrandName());
    paypalAppContext.setLandingPage(PaymentLandingPage.BILLING);
    paypalAppContext.setCancelUrl(urlGenerator.constructPublicDinnerRegistrationOrderCallbackUrl(runningDinner.getPublicSettings().getPublicId(), CALLBACK_URL_TYPE_CANCEL));
    paypalAppContext.setReturnUrl(urlGenerator.constructPublicDinnerRegistrationOrderCallbackUrl(runningDinner.getPublicSettings().getPublicId(), CALLBACK_URL_TYPE_RETURN));
    
    PaypalOrderTO paypalOrder = new PaypalOrderTO();
    paypalOrder.setApplicationContext(paypalAppContext);
    paypalOrder.setIntent(OrderIntent.CAPTURE);
    paypalOrder.setPurchaseUnits(calculatePurchaseUnits(registrationData, paymentOptions));
    
    PaypalOrderResponseTO paypalOrderResponse;
    try {
      paypalOrderResponse = paypalHttpClient.createOrder(paypalOrder);
    } catch (IOException | InterruptedException e) {
      throw new TechnicalException(new Issue(e.getMessage(), IssueType.TECHNICAL), e);
    }

    RegistrationOrder registrationOrder = new RegistrationOrder(paypalOrderResponse.getId(), paypalOrderResponse.getStatus(), runningDinner);
    String registrationDataAsJsonStr = registrationDataMapper.mapToJson(registrationData);
    registrationOrder.setRegistrationDataJsonStr(registrationDataAsJsonStr);
    setLinksFromResponseToRegistrationOrder(paypalOrderResponse, registrationOrder);
    registrationOrder = registrationOrderRepository.save(registrationOrder);
    return registrationOrder;
  }

  public PaypalOrderResponseTO reloadPaypalOrder(String adminId, String paypalOrderId) {
    
    RegistrationOrder registrationOrder = findRegistrationOrder(adminId, paypalOrderId);
    RegistrationOrderLink selfLink = registrationOrder.getSelfLink();
    try {
      return paypalHttpClient.getOrder(selfLink);
    } catch (IOException | InterruptedException e) {
      throw new TechnicalException(new Issue(e.getMessage(), IssueType.TECHNICAL), e);
    }
  }
  
  public RegistrationOrder findRegistrationOrder(@ValidateAdminId String adminId, String paypalOrderId) {
    RegistrationOrder result = registrationOrderRepository.findByAdminIdAndPaypalOrderId(adminId, paypalOrderId);
    validatorService.checkEntityNotNull(result, "Expected to find RegistrationOrder for " + adminId + " and " + paypalOrderId);
    return result;
  }
  
  public RegistrationDataTO findRegistrationDataForOrderId(String adminId, String paypalOrderId) {
    RegistrationOrder registrationOrder = findRegistrationOrder(adminId, paypalOrderId);
    return registrationDataMapper.mapFromJson(registrationOrder.getRegistrationDataJsonStr());
  }

  @Transactional
  public RegistrationOrder captureRegistrationOrder(String adminId, String paypalOrderId, Participant participant) {
    
    RegistrationOrder registrationOrder = findRegistrationOrder(adminId, paypalOrderId);
    checkRegistrationOrderNotCompleted(registrationOrder);

    PaypalCaptureResponseTO captureResponse;
    try {
      captureResponse = paypalHttpClient.captureOrder(paypalOrderId);
    } catch (IOException | InterruptedException e) {
      throw new TechnicalException(new Issue(e.getMessage(), IssueType.TECHNICAL), e);
    }
    
    registrationOrder.setPaypalOrderStatus(captureResponse.getStatus());
    registrationOrder.setParticipantId(participant.getId());
    setPayerInfoFromResponseToRegistrationOrder(captureResponse, registrationOrder);
    return registrationOrderRepository.save(registrationOrder);
  }
  
  @Transactional
  public RegistrationOrder cancelRegistrationOrder(String adminId, String paypalOrderId) {
    
    RegistrationOrder registrationOrder = findRegistrationOrder(adminId, paypalOrderId);
    checkRegistrationOrderNotCompleted(registrationOrder);
    registrationOrder.setPaypalOrderStatus(PaypalOrderStatus.VOIDED);
    return registrationOrderRepository.save(registrationOrder);
  }
  
  private void setPayerInfoFromResponseToRegistrationOrder(PaypalCaptureResponseTO captureResponse, RegistrationOrder registrationOrder) {
    PaypalPayerTO payer = captureResponse.getPayer();
    if (payer != null) {
      registrationOrder.setPayerEmail(payer.getEmailAddress());
      registrationOrder.setPayerId(payer.getId());
      if (payer.getName() != null) {
        registrationOrder.setPayerFullname(payer.getName().getGivenName() + " " + payer.getName().getSurname());
      }
    }
  }
  
  private void setLinksFromResponseToRegistrationOrder(PaypalOrderResponseTO paypalOrderResponse, RegistrationOrder registrationOrder) {
    
    List<LinkTO> links = paypalOrderResponse.getLinks();
    if (CollectionUtils.isEmpty(links)) {
      return;
    }
    
    for (LinkTO link : links) {
      if (StringUtils.equals(link.getRel(), LINK_REL_APPROVE)) {
        registrationOrder.setApproveLink(new RegistrationOrderLink(link.getHref(), link.getRel(), link.getMethod()));
      } else if (StringUtils.equals(link.getRel(), LINK_REL_SELF)) {
        registrationOrder.setSelfLink(new RegistrationOrderLink(link.getHref(), link.getRel(), link.getMethod()));
      } else if (StringUtils.equals(link.getRel(), LINK_REL_UPDATE)) {
        registrationOrder.setUpdateLink(new RegistrationOrderLink(link.getHref(), link.getRel(), link.getMethod()));
      }
    }
  }

  protected static List<PurchaseUnitTO> calculatePurchaseUnits(RegistrationDataTO registrationData, PaymentOptions paymentOptions) {

    final BigDecimal amountValue = calculatePurchaseAmount(paymentOptions, registrationData.isTeamPartnerWishRegistrationDataProvided());
    
    PurchaseUnitTO purchaseUnit = new PurchaseUnitTO();
    MoneyTO amount = new MoneyTO();
    amount.setCurrencyCode(EUR);
    amount.setValue(NumberUtil.getFormattedAmountValue(amountValue, Locale.ENGLISH)); // Paypal expects something like 8.50 EUR
    purchaseUnit.setAmount(amount);
    return Collections.singletonList(purchaseUnit);
  }
  
  public static BigDecimal calculatePurchaseAmount(PaymentOptions paymentOptions, boolean teamPartnerRegistration) {
    BigDecimal amountValue = paymentOptions.getPricePerRegistration();
    if (teamPartnerRegistration) {
      amountValue = amountValue.multiply(new BigDecimal("2"));
    }
    return amountValue;
  }
  

  private static void checkRegistrationOrderNotCompleted(RegistrationOrder registrationOrder) {
    if (registrationOrder.getPaypalOrderStatus() == PaypalOrderStatus.COMPLETED) {
      throw new IllegalStateException("Payment already completed for orderId " + registrationOrder.getPaypalOrderId() + " in " + registrationOrder.getAdminId());
    }
  }

}

