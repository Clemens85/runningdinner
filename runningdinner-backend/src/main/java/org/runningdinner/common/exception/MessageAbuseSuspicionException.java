package org.runningdinner.common.exception;

import org.runningdinner.admin.message.job.MessageJob;

public class MessageAbuseSuspicionException extends RuntimeException {
  
  public static final String ERROR_MESSAGE = "Detected possible message abuse spam suspicion due too many messages. Contact administrator if you think this is wrong.";

  private static final long serialVersionUID = 1L;

  private final MessageJob messageJob;
  
  public MessageAbuseSuspicionException(MessageJob messageJob) {
    super(ERROR_MESSAGE);
    this.messageJob = messageJob;
  }

  public MessageJob getMessageJob() {
  
    return messageJob;
  }
  
}
