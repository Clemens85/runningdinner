package org.runningdinner.mail;

public enum MailProvider {

  SENDGRID_API,
  MAILJET_API,
  AWS_SES_API,
  SMTP,
  MOCK
}
