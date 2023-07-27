package org.runningdinner.payment.paymentoptions.rest;

import java.math.BigDecimal;

import org.runningdinner.common.rest.BaseTO;
import org.runningdinner.payment.paymentoptions.PaymentOptions;

public class PaymentOptionsTO extends BaseTO {

  private BigDecimal pricePerRegistration;

  private String brandName;

  public PaymentOptionsTO() {
    // NOP
  }
  
  public PaymentOptionsTO(PaymentOptions paymentOptions) {
    this.brandName = paymentOptions.getBrandName();
    this.pricePerRegistration = paymentOptions.getPricePerRegistration();
  }
  
  public BigDecimal getPricePerRegistration() {
    return pricePerRegistration;
  }

  public void setPricePerRegistration(BigDecimal pricePerRegistration) {
    this.pricePerRegistration = pricePerRegistration;
  }

  public String getBrandName() {
    return brandName;
  }

  public void setBrandName(String brandName) {
    this.brandName = brandName;
  }

  
}
