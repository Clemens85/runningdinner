package org.runningdinner.core.util;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.Locale;

import org.junit.jupiter.api.Test;

public class NumberUtilTest {

  @Test
  public void integerIsFormattedWithTwoDecimalPlaces() {
    assertThat(NumberUtil.getFormattedAmountValue(new BigDecimal("8"), Locale.GERMAN)).isEqualTo("8,00");
  }


  @Test
  public void integerWithOneDecimalPlaceIsFormattedWithTwoDecimalPlaces() {
    assertThat(NumberUtil.getFormattedAmountValue(new BigDecimal("8.50"), Locale.GERMAN)).isEqualTo("8,50");
  }
  
  @Test
  public void floatIsFormattedWithTwoDecimalPlaces() {
    assertThat(NumberUtil.getFormattedAmountValue(new BigDecimal("8.55"), Locale.GERMAN)).isEqualTo("8,55");
  }
  
  @Test
  public void floatIsRoundedAndCorrectlyFormatted() {
    assertThat(NumberUtil.getFormattedAmountValue(new BigDecimal("8.55321"), Locale.GERMAN)).isEqualTo("8,55");
  }
  
  @Test
  public void englishAmountIsCorrectlyFormatted() {
    assertThat(NumberUtil.getFormattedAmountValue(new BigDecimal("8.55"), Locale.US)).isEqualTo("8.55");
  }
}
