package org.runningdinner.common;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public final class AlertLogger {

  private static final Logger LOGGER = LoggerFactory.getLogger(AlertLogger.class);
  
  private AlertLogger() {
    
    // NOP
  }
  
  public static void logError(String errorMessage) {

    LOGGER.error(errorMessage);
  }
  
  public static void logError(String errorMessage, Throwable exception) {

    LOGGER.error(errorMessage, exception);
  }
}
