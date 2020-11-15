package org.runningdinner.common.exception;

import java.lang.reflect.Method;

import org.runningdinner.common.AlertLogger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.aop.interceptor.AsyncUncaughtExceptionHandler;

public class AsyncExceptionHandler implements AsyncUncaughtExceptionHandler {

  private static final Logger LOG = LoggerFactory.getLogger(AsyncExceptionHandler.class);
  
  
  
  @Override
  public void handleUncaughtException(Throwable ex, Method method, Object... params) {

    if (ex instanceof MessageAbuseSuspicionException) {
      handleMessageAbuseSuspicionException((MessageAbuseSuspicionException) ex);
    } else {
      LOG.error("Unhandled exception in async method {}", method, ex);
    }
  }


  private void handleMessageAbuseSuspicionException(MessageAbuseSuspicionException ex) {

    AlertLogger.logError("Detected message abuse suspicion for dinner " + ex.getMessageJob().getAdminId() + " and while procesing " + ex.getMessageJob());
  }

}
