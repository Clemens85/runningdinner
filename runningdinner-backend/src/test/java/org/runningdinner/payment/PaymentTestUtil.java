package org.runningdinner.payment;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.payment.paypal.LinkTO;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.payment.paymentoptions.PaymentOptions;

public final class PaymentTestUtil {

  public static final String BRAND_NAME = "Taste Night";
  public static final BigDecimal PRICE_PER_REGISTRATION = new BigDecimal("8");
  public static final String PRICE_PER_REGISTRATION_FORMATTED = "8,00";
  
  private PaymentTestUtil() {
    // NOP
  }
  
  public static PaymentOptions newDefaultPaymentOptions(RunningDinner runningDinner) {
    return new PaymentOptions(PRICE_PER_REGISTRATION, BRAND_NAME, runningDinner);
  }
  
  public static List<LinkTO> newPaypalLinkList(String orderId) {
    List<LinkTO> result = new ArrayList<>();
    result.add(newSelfLink(orderId));
    result.add(newApproveLink(orderId));
    result.add(newCaptureLink(orderId));
    return result;
  }
  
  public static LinkTO newSelfLink(String orderId) {
    LinkTO result = new LinkTO();
    result.setRel("self");
    result.setHref("http://localhost:22222/v2/checkout/orders/" + orderId);
    result.setMethod("GET");
    return result;
  }
  
  public static LinkTO newCaptureLink(String orderId) {
    LinkTO result = new LinkTO();
    result.setRel("capture");
    result.setHref("http://localhost:22222/v2/checkout/orders/" + orderId + "/capture");
    result.setMethod("POST");
    return result;
  }
  
  
  
  public static LinkTO newApproveLink(String orderId) {
    LinkTO result = new LinkTO();
    result.setRel("approve");
    result.setHref("http://localhost:22222/checkoutnow?token=" + orderId);
    result.setMethod("GET");
    return result;
  }
}
