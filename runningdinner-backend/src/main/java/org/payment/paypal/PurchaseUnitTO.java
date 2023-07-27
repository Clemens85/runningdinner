package org.payment.paypal;

public class PurchaseUnitTO {

  private MoneyTO amount;

  public MoneyTO getAmount() {
    return amount;
  }

  public void setAmount(MoneyTO amount) {
    this.amount = amount;
  }

}