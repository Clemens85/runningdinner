
package org.runningdinner.admin.message;

import java.io.Serializable;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import org.hibernate.validator.constraints.SafeHtml;
import org.runningdinner.mail.formatter.SimpleTextMessage;

public abstract class BaseMessage implements SimpleTextMessage, Serializable {

  private static final long serialVersionUID = 1L;
  
  public static final int MAX_SUBJECT_LENGTH = 255;
  
  public static final int MAX_MESSAGE_LENGTH = 3048;
  
  @NotBlank
  @SafeHtml
  @Size(max = MAX_SUBJECT_LENGTH, message = "error.message.max.size")
  private String subject;

  @NotBlank
  @SafeHtml
  @Size(max = MAX_MESSAGE_LENGTH, message = "error.message.max.size")
  private String message;
  
  @Override
  public String getSubject() {

    return subject;
  }

  public void setSubject(String subject) {

    this.subject = subject;
  }

  @Override
  public String getMessage() {

    return message;
  }

  public void setMessage(String message) {

    this.message = message;
  }

}
