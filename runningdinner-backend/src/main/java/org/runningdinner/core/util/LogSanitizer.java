package org.runningdinner.core.util;

import org.apache.commons.lang3.StringUtils;

public final class LogSanitizer {

  private LogSanitizer() {
    // NOP
  }

  public static String sanitize(String str) {
    if (str == null) {
      return null;
    }
    String result = str.replaceAll("[^a-zA-Z0-9_-]", StringUtils.EMPTY);
    return StringUtils.truncate(result, 255);
  }
}
