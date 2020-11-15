
package org.runningdinner.admin.message.job;

import javax.persistence.Embeddable;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import org.hibernate.validator.constraints.SafeHtml;
import org.runningdinner.admin.message.BaseMessage;
import org.springframework.mail.SimpleMailMessage;

@Embeddable
public class Message {

  @NotBlank
  @SafeHtml
  @Size(max = BaseMessage.MAX_SUBJECT_LENGTH, message = "error.message.max.size")
  private String subject;

  @NotBlank
  @Size(max = BaseMessage.MAX_MESSAGE_LENGTH, message = "error.message.max.size")
  private String content;

  @NotBlank
  private String replyTo;

  public Message() {
    super();
  }

  public Message(String subject, String content, String replyTo) {
    super();
    this.subject = subject;
    this.content = content;
    this.replyTo = replyTo;
  }

  public String getSubject() {

    return subject;
  }

  public void setSubject(String subject) {

    this.subject = subject;
  }

  public String getContent() {

    return content;
  }

  public void setContent(String content) {

    this.content = content;
  }

  public String getReplyTo() {

    return replyTo;
  }

  public void setReplyTo(String replyTo) {

    this.replyTo = replyTo;
  }

  public SimpleMailMessage toSimpleMailMessage() {

    SimpleMailMessage result = new SimpleMailMessage();
    result.setSubject(getSubject());
    result.setReplyTo(getReplyTo());
    result.setText(getContent());
    return result;
  }

}
