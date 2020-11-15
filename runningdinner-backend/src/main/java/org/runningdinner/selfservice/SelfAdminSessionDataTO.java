package org.runningdinner.selfservice;

import java.util.UUID;

public class SelfAdminSessionDataTO {

  private UUID selfAdministrationId;
  
  private String languageCode;

  public SelfAdminSessionDataTO(UUID selfAdministrationId, String languageCode) {

    super();
    this.selfAdministrationId = selfAdministrationId;
    this.languageCode = languageCode;
  }

  public UUID getSelfAdministrationId() {
  
    return selfAdministrationId;
  }
  
  public String getLanguageCode() {
  
    return languageCode;
  }
  
}
