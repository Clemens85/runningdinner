package org.runningdinner.messaging.integration;


import org.apache.commons.lang3.StringUtils;
import org.runningdinner.common.rest.BaseTO;
import org.runningdinner.core.PublicSettings;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.util.DateTimeUtil;

public class RunningDinnerIntegrationPayload extends BaseTO {
  private String publicDinnerId;
  private String publicDinnerUrl;
  private String publicTitle;
  private String date;
  private String publicEmail;
  private String publicMobileNumber;
  private String publicContact;
  private String adminEmail;
  private String registrationType;

  public RunningDinnerIntegrationPayload(RunningDinner src) {
    this.adminEmail = src.getEmail();
    this.registrationType = src.getRegistrationType().name();
    this.date = DateTimeUtil.formatToIsoString(src.getDate());
    PublicSettings publicSettings = src.getPublicSettings();
    if (publicSettings != null && StringUtils.isNotEmpty(publicSettings.getPublicId())) {
      this.publicDinnerId = publicSettings.getPublicId();
      this.publicDinnerUrl = publicSettings.getPublicDinnerUrl();
      this.publicTitle = publicSettings.getPublicTitle();
      this.publicEmail = publicSettings.getPublicContactEmail();
      this.publicMobileNumber = publicSettings.getPublicContactMobileNumber();
      this.publicContact = publicSettings.getPublicContactName();
    }
  }

  public String getPublicDinnerId() {
    return publicDinnerId;
  }

  public void setPublicDinnerId(String publicDinnerId) {
    this.publicDinnerId = publicDinnerId;
  }

  public String getPublicDinnerUrl() {
    return publicDinnerUrl;
  }

  public void setPublicDinnerUrl(String publicDinnerUrl) {
    this.publicDinnerUrl = publicDinnerUrl;
  }

  public String getPublicTitle() {
    return publicTitle;
  }

  public void setPublicTitle(String publicTitle) {
    this.publicTitle = publicTitle;
  }

  public String getDate() {
    return date;
  }

  public void setDate(String date) {
    this.date = date;
  }

  public String getPublicEmail() {
    return publicEmail;
  }

  public void setPublicEmail(String publicEmail) {
    this.publicEmail = publicEmail;
  }

  public String getPublicMobileNumber() {
    return publicMobileNumber;
  }

  public void setPublicMobileNumber(String publicMobileNumber) {
    this.publicMobileNumber = publicMobileNumber;
  }

  public String getPublicContact() {
    return publicContact;
  }

  public void setPublicContact(String publicContact) {
    this.publicContact = publicContact;
  }

  public String getAdminEmail() {
    return adminEmail;
  }

  public void setAdminEmail(String adminEmail) {
    this.adminEmail = adminEmail;
  }

  public String getRegistrationType() {
    return registrationType;
  }

  public void setRegistrationType(String registrationType) {
    this.registrationType = registrationType;
  }
}
