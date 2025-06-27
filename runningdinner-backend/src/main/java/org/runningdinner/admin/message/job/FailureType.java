package org.runningdinner.admin.message.job;


public enum FailureType {

  /**
   * Email was sent but not delivered to recipient, e.g. due to full mailbox or temporary server issues or other issue
   */
  BOUNCE,
  
  INVALID_EMAIL,

  /**
   * Complaint from recipient, e.g. via spam button in email client
   */
  SPAM,

  /**
   * Blocked from destination mail server, e.g. due to too many bounces or spam complaints
   */
  BLOCKED,

  /**
   * Internal error of ourselves if we suspected too many emails being sent
   */
  ABUSE_SUSPICION
}
