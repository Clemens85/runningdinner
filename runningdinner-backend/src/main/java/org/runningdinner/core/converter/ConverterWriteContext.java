package org.runningdinner.core.converter;

import java.util.Locale;

import org.runningdinner.mail.formatter.MessageFormatterHelperService;

public class ConverterWriteContext {

  private Locale locale;

  private MessageFormatterHelperService messageFormatterHelperService;

  public ConverterWriteContext(Locale locale, MessageFormatterHelperService messageFormatterHelperService) {
    this.locale = locale;
    this.messageFormatterHelperService = messageFormatterHelperService;
  }

  public Locale getLocale() {
    return locale;
  }

  public MessageFormatterHelperService getMessageFormatterHelperService() {
    return messageFormatterHelperService;
  }

}
