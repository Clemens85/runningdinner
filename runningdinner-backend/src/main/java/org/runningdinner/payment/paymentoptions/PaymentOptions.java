package org.runningdinner.payment.paymentoptions;

import java.math.BigDecimal;

import javax.persistence.Access;
import javax.persistence.AccessType;
import javax.persistence.Entity;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.validator.constraints.SafeHtml;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinnerRelatedEntity;

@Entity
@Access(AccessType.FIELD)
public class PaymentOptions extends RunningDinnerRelatedEntity {

  @NotNull
  @Min(value = 0)
  private BigDecimal pricePerRegistration;

  @Size(max = 127)
  @NotEmpty
  private String brandName;
  
  @SafeHtml
  @Size(max = 512)
  private String agbLink;
  
  @SafeHtml
  @Size(max = 512)
  private String redirectAfterPurchaseLink;
  
  protected PaymentOptions() {
    // NOP
  }

  public PaymentOptions(BigDecimal pricePerRegistration, String brandName, RunningDinner runningDinner) {
    super(runningDinner);
    this.pricePerRegistration = pricePerRegistration;
    this.brandName = brandName;
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
    this.brandName = StringUtils.trim(brandName);
  }

  public String getAgbLink() {
    return agbLink;
  }

  public void setAgbLink(String agbLink) {
    this.agbLink = StringUtils.trim(agbLink);
  }

  public String getRedirectAfterPurchaseLink() {
    return redirectAfterPurchaseLink;
  }

  public void setRedirectAfterPurchaseLink(String redirectAfterPurchaseLink) {
    this.redirectAfterPurchaseLink = StringUtils.trim(redirectAfterPurchaseLink);
  }
}
