package org.runningdinner.mail;

public enum MailProvider {

  /**
   * @deprecated Keep this for database compatibility, but do not use it anymore. Can be removed if no MessageTask with this provider exists anymore.
   */
  @Deprecated
  SENDGRID,

  MAILJET,
  AWS_SES,
  SMTP,
  MOCK
}
