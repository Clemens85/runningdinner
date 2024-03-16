
package org.runningdinner.core;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Transient;

@Embeddable
public class PublicSettings {

  @Column(length = 48)
  private String publicId;

  @Column(length = 256)
  private String publicTitle;

  @Column(length = 4096)
  private String publicDescription;
  
  @Column(length = 255)
  private String publicContactName;

  @Column(length = 255)
  private String publicContactEmail;
  
  @Column(length = 255)
  private String publicContactMobileNumber;
  
  @Transient
  private String publicDinnerUrl;

  private LocalDate endOfRegistrationDate;
  
  private boolean registrationDeactivated;

  public PublicSettings() {

  }

  public PublicSettings(String publicTitle, String publicDescription, LocalDate endOfRegistrationDate, boolean registrationDeactivated) {
    super();
    this.publicTitle = publicTitle;
    this.publicDescription = publicDescription;
    this.endOfRegistrationDate = endOfRegistrationDate;
    this.registrationDeactivated = registrationDeactivated;
  }

  public String getPublicId() {

    return publicId;
  }

  public void setPublicId(String publicId) {

    this.publicId = publicId;
  }

  public String getPublicTitle() {

    return publicTitle;
  }

  public void setPublicTitle(String publicTitle) {

    this.publicTitle = publicTitle;
  }

  public String getPublicDescription() {

    return publicDescription;
  }

  public void setPublicDescription(String publicDescription) {

    this.publicDescription = publicDescription;
  }

  public LocalDate getEndOfRegistrationDate() {

    return endOfRegistrationDate;
  }

  public void setEndOfRegistrationDate(LocalDate endOfRegistrationDate) {

    this.endOfRegistrationDate = endOfRegistrationDate;
  }

  public String getPublicDinnerUrl() {
  
    return publicDinnerUrl;
  }
  
  public void setPublicDinnerUrl(String publicDinnerUrl) {
  
    this.publicDinnerUrl = publicDinnerUrl;
  }
  
  public boolean isRegistrationDeactivated() {
  
    return registrationDeactivated;
  }
  
  public void setRegistrationDeactivated(boolean registrationDeactivated) {
  
    this.registrationDeactivated = registrationDeactivated;
  }
  
  public String getPublicContactName() {
  
    return publicContactName;
  }

  public void setPublicContactName(String publicContactName) {
  
    this.publicContactName = publicContactName;
  }

  public String getPublicContactEmail() {
  
    return publicContactEmail;
  }

  public void setPublicContactEmail(String publicContactEmail) {
  
    this.publicContactEmail = publicContactEmail;
  }

  public String getPublicContactMobileNumber() {
  
    return publicContactMobileNumber;
  }

  public void setPublicContactMobileNumber(String publicContactMobileNumber) {
  
    this.publicContactMobileNumber = publicContactMobileNumber;
  }

  public PublicSettings createDetachedClone() {

    PublicSettings result = new PublicSettings();
    result.setEndOfRegistrationDate(getEndOfRegistrationDate());
    result.setPublicDescription(getPublicDescription());
    result.setPublicDinnerUrl(getPublicDinnerUrl());
    result.setPublicId(getPublicId());
    result.setPublicTitle(getPublicTitle());
    result.setRegistrationDeactivated(isRegistrationDeactivated());
    result.setPublicContactEmail(getPublicContactEmail());
    result.setPublicContactMobileNumber(getPublicContactMobileNumber());
    result.setPublicContactName(getPublicContactName());
    return result;
  }

  @Override
  public String toString() {

    return "publicId=" + publicId + ", publicTitle=" + publicTitle + ", endOfRegistrationDate=" + endOfRegistrationDate;
  }

}
