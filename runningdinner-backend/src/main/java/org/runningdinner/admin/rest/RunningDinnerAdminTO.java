
package org.runningdinner.admin.rest;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import org.runningdinner.admin.RunningDinnerSessionData;
import org.runningdinner.common.rest.BaseTO;
import org.runningdinner.contract.Contract;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinner.RunningDinnerType;
import org.runningdinner.core.RunningDinnerInfo;
import org.runningdinner.wizard.BasicDetailsTO;
import org.runningdinner.wizard.OptionsTO;
import org.runningdinner.wizard.PublicSettingsTO;
import org.runningdinner.wizard.upload.ParticipantUploadSettingsTO;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class RunningDinnerAdminTO extends BaseTO implements RunningDinnerInfo, Serializable {

  private static final long serialVersionUID = 7828170945898639587L;

  @NotBlank
  @Email
  private String email;

  private String adminId;

  @NotNull
  private BasicDetailsTO basicDetails = new BasicDetailsTO();

  @NotNull
  private OptionsTO options = new OptionsTO();

  private ParticipantUploadSettingsTO participantUploadSettings;

  private PublicSettingsTO publicSettings;
  
  private LocalDateTime cancellationDate;

  @NotNull
  private RunningDinnerType runningDinnerType; 
  
  private LocalDateTime acknowledgedDate;
  
  private RunningDinnerSessionData sessionData;

  private Contract contract;
  
  public RunningDinnerAdminTO() {

  }

  public RunningDinnerAdminTO(RunningDinner runningDinner) {
    super(runningDinner);
    this.adminId = runningDinner.getAdminId();
    this.email = runningDinner.getEmail();
    this.basicDetails = new BasicDetailsTO(runningDinner);
    this.options = new OptionsTO(runningDinner.getConfiguration());
    this.publicSettings = new PublicSettingsTO(runningDinner.getPublicSettings(), false);
    this.cancellationDate = runningDinner.getCancellationDate();
    this.acknowledgedDate = runningDinner.getAcknowledgedDate();
    this.runningDinnerType = runningDinner.getRunningDinnerType();
  }

  public String getEmail() {

    return email;
  }

  public void setEmail(String email) {

    this.email = email;
  }

  public BasicDetailsTO getBasicDetails() {

    return basicDetails;
  }

  public void setBasicDetails(BasicDetailsTO basicDetails) {

    this.basicDetails = basicDetails;
  }

  public OptionsTO getOptions() {

    return options;
  }

  public void setOptions(OptionsTO options) {

    this.options = options;
  }

  public ParticipantUploadSettingsTO getParticipantUploadSettings() {

    return participantUploadSettings;
  }

  public void setParticipantUploadSettings(ParticipantUploadSettingsTO participantUploadSettings) {

    this.participantUploadSettings = participantUploadSettings;
  }

  public PublicSettingsTO getPublicSettings() {

    return publicSettings;
  }

  public void setPublicSettings(PublicSettingsTO publicSettings) {

    this.publicSettings = publicSettings;
  }

  public String getAdminId() {

    return adminId;
  }

  public void setAdminId(String adminId) {

    this.adminId = adminId;
  }

  @Override
  public String getTitle() {

    return basicDetails.getTitle();
  }

  @Override
  public LocalDate getDate() {

    return basicDetails.getDate();
  }

  @Override
  public String getCity() {

    return basicDetails.getCity();
  }

  @Override
  public String getZip() {

    return basicDetails.getZip();
  }

  @Override
  public RegistrationType getRegistrationType() {

    return basicDetails.getRegistrationType();
  }

  @Override
  public String getLanguageCode() {

    return basicDetails.getLanguageCode();
  }

  public RunningDinnerSessionData getSessionData() {

    return sessionData;
  }

  public void setSessionData(RunningDinnerSessionData sessionData) {

    this.sessionData = sessionData;
  }

  public LocalDateTime getCancellationDate() {
  
    return cancellationDate;
  }

  public LocalDateTime getAcknowledgedDate() {
  
    return acknowledgedDate;
  }

  public RunningDinnerType getRunningDinnerType() {
  
    return runningDinnerType;
  }
  
  public Contract getContract() {
  
    return contract;
  }
  
  public void setContract(Contract contract) {
  
    this.contract = contract;
  }
  
}
