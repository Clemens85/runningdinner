package org.runningdinner.feedback;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import org.hibernate.validator.constraints.SafeHtml;
import org.runningdinner.admin.message.BaseMessage;
import org.runningdinner.core.AbstractEntity;

import com.google.common.base.MoreObjects;

@Entity
public class Feedback extends AbstractEntity {

  private static final long serialVersionUID = 1L;

  @NotBlank
  @SafeHtml
  @Email
  @Column(nullable = false, length = 255)
  private String senderEmail;

  @NotBlank
  @SafeHtml
  @Size(max = BaseMessage.MAX_MESSAGE_LENGTH, message = "error.message.max.size")
  @Column(nullable = false, length = 2048)
  private String message;

  @SafeHtml
  private String pageName;

  @SafeHtml
  private String adminId;

  @SafeHtml
  private String senderIp;
  
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 64)
  private DeliveryState deliveryState = DeliveryState.NOT_DELIVERED;

  public String getSenderEmail() {

    return senderEmail;
  }

  public void setSenderEmail(String senderEmail) {

    this.senderEmail = senderEmail;
  }

  public String getMessage() {

    return message;
  }

  public void setMessage(String message) {

    this.message = message;
  }

  public String getPageName() {

    return pageName;
  }

  public void setPageName(String pageName) {

    this.pageName = pageName;
  }

  public String getAdminId() {

    return adminId;
  }

  public void setAdminId(String adminId) {

    this.adminId = adminId;
  }

  public String getSenderIp() {

    return senderIp;
  }

  public void setSenderIp(String senderIp) {

    this.senderIp = senderIp;
  }

  public DeliveryState getDeliveryState() {
  
    return deliveryState;
  }
  
  public void setDeliveryState(DeliveryState deliveryState) {
  
    this.deliveryState = deliveryState;
  }

  @Override 
  public String toString() {

    return MoreObjects.toStringHelper(this)
            .add("senderEmail", senderEmail)
            .add("message", message)
            .add("adminId", adminId)
            .toString();
  }
  
  public enum DeliveryState {
    
    DELIVERED,
    
    NOT_DELIVERED
  }
}
