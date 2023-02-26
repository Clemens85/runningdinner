package org.runningdinner.admin.message.job;


public enum MessageType {

  PARTICIPANT, 
  TEAM,
  DINNER_ROUTE,
  
  TEAM_HOST_CHANGED_BY_PARTICIPANT,
  
  NEW_RUNNING_DINNER,
  
  PARTICIPANT_SUBSCRIPTION_ACTIVATION,
  
  TEAM_PARTNER_WISH;
  
  public boolean isAcknowledgedDinnerNeeded() {
    
    return this != NEW_RUNNING_DINNER && this != PARTICIPANT_SUBSCRIPTION_ACTIVATION && this != MessageType.TEAM_PARTNER_WISH;
  }
  
  public boolean isSendingToDinnerAdminInDemoModeNeeded() {

    return this != NEW_RUNNING_DINNER && this != PARTICIPANT_SUBSCRIPTION_ACTIVATION;
  }
}
