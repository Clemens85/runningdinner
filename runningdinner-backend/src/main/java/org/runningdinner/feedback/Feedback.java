package org.runningdinner.feedback;

import com.google.common.base.MoreObjects;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.SafeHtml;
import org.runningdinner.admin.message.BaseMessage;
import org.runningdinner.core.AbstractEntity;
import org.runningdinner.core.FuzzyBoolean;

import java.util.UUID;

@Entity
public class Feedback extends AbstractEntity {

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

  private UUID threadId;

	@Enumerated(EnumType.STRING)
	private FuzzyBoolean resolved = FuzzyBoolean.UNKNOWN;

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

  public UUID getThreadId() {
    return threadId;
  }

  public void setThreadId(UUID threadId) {
    this.threadId = threadId;
  }


	public FuzzyBoolean getResolved() {
		return resolved;
	}

	public void setResolved(FuzzyBoolean resolved) {
		this.resolved = resolved;
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
