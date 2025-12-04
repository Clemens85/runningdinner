package org.runningdinner.core.util;

import org.apache.commons.lang3.StringUtils;

public final class LogSanitizer {

  private LogSanitizer() {
    // NOP
  }

  public static String sanitize(String str) {
		return sanitize(str, 255);
  }


	public static String sanitize(String str, int maxLength) {
		if (str == null) {
			return null;
		}
		String result = str.replaceAll("[^a-zA-Z0-9_-]", StringUtils.EMPTY);
		return StringUtils.truncate(result, maxLength);
	}

}
