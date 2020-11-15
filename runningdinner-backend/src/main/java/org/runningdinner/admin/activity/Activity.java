package org.runningdinner.admin.activity;

import java.time.LocalDateTime;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinnerRelatedEntity;

@Entity
public class Activity extends RunningDinnerRelatedEntity {

  private static final long serialVersionUID = 1L;

  @Column(nullable = false)
  private LocalDateTime activityDate;

  @Column(length = 256)
  private String originator = StringUtils.EMPTY;

  @Column(length = 255)
  private String activityHeadline;
  
  @Column(length = 2048)
  private String activityMessage;
  
  @Enumerated(EnumType.STRING)
  @Column(length = 64, nullable = false)
  private ActivityType activityType;
  
  @Column(nullable = true)
  private UUID relatedEntityId;
  
  @Column(nullable = true)
  @Enumerated(EnumType.STRING)
  private RelatedEntityType relatedEntityType;

  public Activity() {
    super();
  }

  public Activity(LocalDateTime activityDate, ActivityType activityType, String originator, RunningDinner runningDinner) {
    super(runningDinner);
    this.activityDate = activityDate;
    this.activityType = activityType;
    this.originator = originator;
  }

  public LocalDateTime getActivityDate() {

    return activityDate;
  }

  public void setActivityDate(LocalDateTime activityDate) {

    this.activityDate = activityDate;
  }

  public String getOriginator() {

    return originator;
  }

  public void setOriginator(String originator) {

    this.originator = originator;
  }

  public String getActivityMessage() {
  
    return activityMessage;
  }
  
  public void setActivityMessage(String activityMessage) {
  
    this.activityMessage = activityMessage;
  }

  public ActivityType getActivityType() {

    return activityType;
  }

  public void setActivityType(ActivityType activityType) {

    this.activityType = activityType;
  }

  public String getActivityHeadline() {
  
    return activityHeadline;
  }
  
  public void setActivityHeadline(String activityHeadline) {
  
    this.activityHeadline = activityHeadline;
  }

  public UUID getRelatedEntityId() {
  
    return relatedEntityId;
  }
  
  public void setRelatedEntityId(UUID relatedEntityId) {
  
    this.relatedEntityId = relatedEntityId;
  }

  public RelatedEntityType getRelatedEntityType() {

    return relatedEntityType;
  }

  public void setRelatedEntityType(RelatedEntityType relatedEntityType) {

    this.relatedEntityType = relatedEntityType;
  }

  @Override
  public String toString() {

    return "activityDate=" + activityDate + ", activityType=" + activityType + ", adminId=" + getAdminId();
  }

}
