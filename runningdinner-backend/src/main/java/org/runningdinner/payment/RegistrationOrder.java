package org.runningdinner.payment;

import java.util.UUID;

import jakarta.persistence.Access;
import jakarta.persistence.AccessType;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import org.payment.paypal.PaypalOrderStatus;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinnerRelatedEntity;

@Entity
@Access(AccessType.FIELD)
public class RegistrationOrder extends RunningDinnerRelatedEntity {

  @Column(length = 255, nullable = false)
  private String paypalOrderId;

  @Enumerated(EnumType.STRING)
  @Column(length = 64, nullable = false)
  private PaypalOrderStatus paypalOrderStatus;

  @Embedded
  @AttributeOverrides({
    @AttributeOverride(name = "href", column = @Column(nullable = false, name = "approveLinkHref")),
    @AttributeOverride(name = "rel", column = @Column(nullable = false, name = "approveLinkRel")),
    @AttributeOverride(name = "method", column = @Column(nullable = false, name = "approveLinkMethod"))
  })
  private RegistrationOrderLink approveLink;
  
  @Embedded
  @AttributeOverrides({
    @AttributeOverride(name = "href", column = @Column(name = "selfLinkHref")),
    @AttributeOverride(name = "rel", column = @Column(name = "selfLinkRel")),
    @AttributeOverride(name = "method", column = @Column(name = "selfLinkMethod"))
  })
  private RegistrationOrderLink selfLink;
  
  @Embedded
  @AttributeOverrides({
    @AttributeOverride(name = "href", column = @Column(name = "updateLinkHref")),
    @AttributeOverride(name = "rel", column = @Column(name = "updateLinkRel")),
    @AttributeOverride(name = "method", column = @Column(name = "updateLinkMethod"))
  })
  private RegistrationOrderLink updateLink;
  
  private UUID participantId;
  
  private String payerEmail;
  
  private String payerFullname;
  
  private String payerId;
  
  /**
   * Due to I am currently on Hibernate 5.x I don't use JSONB (this is out-of-the-box supported in Hibernate 6.x).
   * I use a simple approach to just store it as text and manually map between the JSON and object representation which is for
   * now good enough due to I won't need this data anyway very likely.
   */
  @Column
  private String registrationDataJsonStr;
  
  protected RegistrationOrder() {
    // NOP
  }
  
  public RegistrationOrder(String paypalOrderId, PaypalOrderStatus paypalOrderStatus, RunningDinner runningDinner) {
    super(runningDinner);
    this.paypalOrderId = paypalOrderId;
    this.paypalOrderStatus = paypalOrderStatus;
  }

  public UUID getParticipantId() {
    return participantId;
  }

  public void setParticipantId(UUID participantId) {
    this.participantId = participantId;
  }

  public String getPaypalOrderId() {
    return paypalOrderId;
  }

  public void setPaypalOrderId(String paypalOrderId) {
    this.paypalOrderId = paypalOrderId;
  }

  public PaypalOrderStatus getPaypalOrderStatus() {
    return paypalOrderStatus;
  }

  public void setPaypalOrderStatus(PaypalOrderStatus paypalOrderStatus) {
    this.paypalOrderStatus = paypalOrderStatus;
  }

  public String getRegistrationDataJsonStr() {
    return registrationDataJsonStr;
  }

  public void setRegistrationDataJsonStr(String registrationDataJsonStr) {
    this.registrationDataJsonStr = registrationDataJsonStr;
  }

  public RegistrationOrderLink getApproveLink() {
    return approveLink;
  }

  public void setApproveLink(RegistrationOrderLink approveLink) {
    this.approveLink = approveLink;
  }

  public RegistrationOrderLink getSelfLink() {
    return selfLink;
  }

  public void setSelfLink(RegistrationOrderLink selfLink) {
    this.selfLink = selfLink;
  }

  public RegistrationOrderLink getUpdateLink() {
    return updateLink;
  }

  public void setUpdateLink(RegistrationOrderLink updateLink) {
    this.updateLink = updateLink;
  }

  public String getPayerEmail() {
    return payerEmail;
  }

  public void setPayerEmail(String payerEmail) {
    this.payerEmail = payerEmail;
  }

  public String getPayerFullname() {
    return payerFullname;
  }

  public void setPayerFullname(String payerFullname) {
    this.payerFullname = payerFullname;
  }

  public String getPayerId() {
    return payerId;
  }

  public void setPayerId(String payerId) {
    this.payerId = payerId;
  }
  
  
}
