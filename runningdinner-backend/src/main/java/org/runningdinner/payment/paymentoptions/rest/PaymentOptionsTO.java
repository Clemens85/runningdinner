package org.runningdinner.payment.paymentoptions.rest;

import java.math.BigDecimal;

import org.runningdinner.common.rest.BaseTO;
import org.runningdinner.payment.paymentoptions.PaymentOptions;

public class PaymentOptionsTO extends BaseTO {

  private BigDecimal pricePerRegistration;
  
  private String pricePerRegistrationFormatted;

  private String brandName;
  
  private String agbLink;
  
  private String redirectAfterPurchaseLink;

  protected PaymentOptionsTO() {
    // NOP
  }
  
  public PaymentOptionsTO(PaymentOptions src, String pricePerRegistrationFormatted) {
    this.brandName = src.getBrandName();
    this.pricePerRegistration = src.getPricePerRegistration();
    this.pricePerRegistrationFormatted = pricePerRegistrationFormatted;
    this.agbLink = src.getAgbLink();
    this.redirectAfterPurchaseLink = src.getRedirectAfterPurchaseLink();
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

  public String getAgbLink() {
    return agbLink;
  }

  public void setAgbLink(String agbLink) {
    this.agbLink = agbLink;
  }

  public String getRedirectAfterPurchaseLink() {
    return redirectAfterPurchaseLink;
  }

  public void setRedirectAfterPurchaseLink(String redirectAfterPurchaseLink) {
    this.redirectAfterPurchaseLink = redirectAfterPurchaseLink;
  }
  
  
}
