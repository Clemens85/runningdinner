package org.runningdinner.participant.registrationinfo;

import java.util.List;

public class ParticipantRegistrationInfoList {

  private List<ParticipantRegistrationInfo> registrations;
  
  private List<ParticipantRegistrationInfo> notActivatedRegistrationsTooOld;
  
  private int page = 0;

  private boolean hasMore = false;
  
  public ParticipantRegistrationInfoList(List<ParticipantRegistrationInfo> registrations, int page, boolean hasMore) {
    this.registrations = registrations;
    this.page = page;
    this.hasMore = hasMore;
  }

  protected ParticipantRegistrationInfoList() {
    // NOP
  }
  
  public List<ParticipantRegistrationInfo> getNotActivatedRegistrationsTooOld() {
    return notActivatedRegistrationsTooOld;
  }

  public void setNotActivatedRegistrationsTooOld(List<ParticipantRegistrationInfo> notActivatedRegistrationsTooOld) {
    this.notActivatedRegistrationsTooOld = notActivatedRegistrationsTooOld;
  }

  public List<ParticipantRegistrationInfo> getRegistrations() {
    return registrations;
  }

  public int getPage() {
    return page;
  }

  public boolean isHasMore() {
    return hasMore;
  }
  
  
  
}
