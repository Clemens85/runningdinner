package org.payment.paypal;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PaypalOrderTO {

  private OrderIntent intent;

  @JsonProperty("purchase_units")
  private List<PurchaseUnitTO> purchaseUnits;

  @JsonProperty("application_context")
  private PayPalAppContextTO applicationContext;

  public OrderIntent getIntent() {
    return intent;
  }

  public void setIntent(OrderIntent intent) {
    this.intent = intent;
  }

  public List<PurchaseUnitTO> getPurchaseUnits() {
    return purchaseUnits;
  }

  public void setPurchaseUnits(List<PurchaseUnitTO> purchaseUnits) {
    this.purchaseUnits = purchaseUnits;
  }

  public PayPalAppContextTO getApplicationContext() {
    return applicationContext;
  }

  public void setApplicationContext(PayPalAppContextTO applicationContext) {
    this.applicationContext = applicationContext;
  }

}
