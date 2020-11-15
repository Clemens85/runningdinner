
package org.runningdinner.core.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.TimeZone;

import org.apache.commons.lang3.StringUtils;
import org.springframework.util.Assert;

public final class DateTimeUtil {

  private static final DateTimeFormatter DEFAULT_TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm", Locale.GERMAN);
  private static final DateTimeFormatter DEFAULT_DATE_FORMATTER = DateTimeFormatter.ofPattern("dd.MM.yyyy", Locale.GERMAN);
  private static final DateTimeFormatter DEFAULT_DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm", Locale.GERMAN);
  
  private static final DateTimeFormatter DEFAULT_TIME_FORMATTER_EN = DateTimeFormatter.ofPattern("HH:mm", Locale.ENGLISH);
  private static final DateTimeFormatter DEFAULT_DATE_FORMATTER_EN = DateTimeFormatter.ofPattern("yyyy-MM-dd", Locale.ENGLISH);
  private static final DateTimeFormatter DEFAULT_DATE_TIME_FORMATTER_EN = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm", Locale.ENGLISH);
  
  public static final String EUROPE_BERLIN_TIME_ZONE = "Europe/Berlin";

  private DateTimeUtil() {

  }

  public static DateTimeFormatter getTimeFormatter(String languageCode) {

    return isEnglish(languageCode) ? DEFAULT_TIME_FORMATTER_EN : DEFAULT_TIME_FORMATTER;
  }

  public static DateTimeFormatter getDateFormatter(String languageCode) {

    return isEnglish(languageCode) ? DEFAULT_DATE_FORMATTER_EN : DEFAULT_DATE_FORMATTER;
  }
  
  public static String getDefaultFormattedDate(LocalDateTime date, String languageCode) {
    
    return isEnglish(languageCode) ? date.format(DEFAULT_DATE_TIME_FORMATTER_EN) : date.format(DEFAULT_DATE_TIME_FORMATTER) ;
  }
  
  public static String getDefaultFormattedDate(LocalDate date, String languageCode) {
    
    return isEnglish(languageCode) ? date.format(DEFAULT_DATE_FORMATTER_EN) : date.format(DEFAULT_DATE_FORMATTER);
  }
  
//  
//  public static String getDefaultFormattedDate(LocalDateTime date, String fallback) {
//    
//    if (date == null) {
//      return fallback;
//    }
//    return date.format(DEFAULT_DATE_TIME_FORMATTER);
//  }

  public static void setDefaultTimeZoneToEuropeBerlin() {

    System.setProperty("user.timezone", EUROPE_BERLIN_TIME_ZONE);
    TimeZone.setDefault(TimeZone.getTimeZone(DateTimeUtil.getTimeZoneForEuropeBerlin()));
  }
  
  public static ZoneId getTimeZoneForEuropeBerlin() {

    return ZoneId.of(EUROPE_BERLIN_TIME_ZONE);
  }

  public static long toUnixTimestamp(LocalDateTime time) {
    
    ZoneId europeTimeZone = getTimeZoneForEuropeBerlin();
    return time.atZone(europeTimeZone).toEpochSecond();
  }
  
  public static LocalDateTime fromUnixTimestamp(long timestampSeconds) {
    
    ZoneId europeTimeZone = getTimeZoneForEuropeBerlin();
    return Instant.ofEpochSecond(timestampSeconds).atZone(europeTimeZone).toLocalDateTime();
  }

  public static LocalDate min(LocalDate a, LocalDate b) {

    Assert.notNull(a, "a");
    Assert.notNull(b, "b");

    final int comparison = a.compareTo(b);
    if (comparison == 0 || comparison < 0) {
      return a;
    } else {
      return b;
    }
  }
  
  private static boolean isEnglish(String languageCode) {
    
    return StringUtils.equalsIgnoreCase(StringUtils.trim(languageCode), "en");
  }
}
