package org.runningdinner.frontend.rest;

import java.math.BigDecimal;

import org.runningdinner.payment.paymentoptions.rest.PaymentOptionsTO;

public class RegistrationPaymentSummaryTO extends PaymentOptionsTO {

  private boolean teamPartnerRegistration;
  
  private String totalPriceFormatted;
  
  protected RegistrationPaymentSummaryTO() {
    // NOP
  }

  public RegistrationPaymentSummaryTO(String brandName, BigDecimal pricePerRegistration, String pricePerRegistrationFormatted) {
    super(brandName, pricePerRegistration, pricePerRegistrationFormatted);
  }

  public boolean isTeamPartnerRegistration() {
    return teamPartnerRegistration;
  }

  public void setTeamPartnerRegistration(boolean teamPartnerRegistration) {
    this.teamPartnerRegistration = teamPartnerRegistration;
  }

  public String getTotalPriceFormatted() {
    return totalPriceFormatted;
  }

  public void setTotalPriceFormatted(String totalPriceFormatted) {
    this.totalPriceFormatted = totalPriceFormatted;
  }
  
}
