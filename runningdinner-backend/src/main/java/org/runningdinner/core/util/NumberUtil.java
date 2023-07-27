package org.runningdinner.core.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.util.Locale;

public final class NumberUtil {

  private NumberUtil() {
    // NOP
  }
  
  public static String getFormattedAmountValue(BigDecimal amountValue, Locale locale) {
    BigDecimal moneyAmount = amountValue.setScale(2, RoundingMode.FLOOR);
    return NumberFormat.getNumberInstance(locale).format(moneyAmount);
  }
}
