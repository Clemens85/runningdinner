package org.runningdinner.payment.paymentoptions.rest;

import java.math.BigDecimal;

import org.runningdinner.common.rest.BaseTO;

public class PaymentOptionsTO extends BaseTO {

  private BigDecimal pricePerRegistration;
  
  private String pricePerRegistrationFormatted;

  private String brandName;

  protected PaymentOptionsTO() {
    // NOP
  }
  
  public PaymentOptionsTO(String brandName, BigDecimal pricePerRegistration, String pricePerRegistrationFormatted) {
    this.brandName = brandName;
    this.pricePerRegistration = pricePerRegistration;
    this.pricePerRegistrationFormatted = pricePerRegistrationFormatted;
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

  public String getPricePerRegistrationFormatted() {
    return pricePerRegistrationFormatted;
  }

  public void setPricePerRegistrationFormatted(String pricePerRegistrationFormatted) {
    this.pricePerRegistrationFormatted = pricePerRegistrationFormatted;
  }
}
