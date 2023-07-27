package org.runningdinner.payment.paymentoptions;

import java.math.BigDecimal;

import javax.persistence.Access;
import javax.persistence.AccessType;
import javax.persistence.Entity;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

import org.hibernate.validator.constraints.Length;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinnerRelatedEntity;

@Entity
@Access(AccessType.FIELD)
public class PaymentOptions extends RunningDinnerRelatedEntity {

  @NotNull
  @Min(value = 0)
  private BigDecimal pricePerRegistration;

  @Length(max = 127)
  @NotEmpty
  private String brandName;
  
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
    this.brandName = brandName;
  }

}
