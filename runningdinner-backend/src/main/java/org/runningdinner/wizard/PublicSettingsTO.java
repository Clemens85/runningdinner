
package org.runningdinner.wizard;

import java.io.Serializable;
import java.time.LocalDate;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.validator.constraints.Length;
import org.hibernate.validator.constraints.SafeHtml;
import org.runningdinner.core.PublicSettings;
import org.runningdinner.mail.formatter.FormatterUtil;

public class PublicSettingsTO implements Serializable {

  private static final long serialVersionUID = 1L;

  @NotBlank
  @SafeHtml
  private String title;

  @NotBlank
  @SafeHtml
  @Size(max = 4096, message = "error.message.max.size")
  private String description;

  @NotNull
  private LocalDate endOfRegistrationDate;
  
  @Size(max = 255)
  @SafeHtml
  @NotBlank
  private String publicContactName;

  @Size(max = 255)
  @SafeHtml
  @NotBlank
  @Email
  private String publicContactEmail;
  
  @Size(max = 255)
  @SafeHtml
  private String publicContactMobileNumber;
  
  private boolean registrationDeactivated;

  private String publicDinnerId = StringUtils.EMPTY;

  private String publicDinnerUrl = StringUtils.EMPTY;

  protected PublicSettingsTO() {
    // Needed for json
  }

  public PublicSettingsTO(PublicSettings publicSettings, boolean htmlFormatContent) {
    this.title = publicSettings.getPublicTitle();
    this.description = publicSettings.getPublicDescription();
    this.endOfRegistrationDate = publicSettings.getEndOfRegistrationDate();
    this.publicDinnerId = publicSettings.getPublicId();
    this.publicDinnerUrl = publicSettings.getPublicDinnerUrl();
    this.registrationDeactivated = publicSettings.isRegistrationDeactivated();
    if (htmlFormatContent) {
      this.description = FormatterUtil.getHtmlFormattedMessage(publicSettings.getPublicDescription());
    }
    this.publicContactEmail = publicSettings.getPublicContactEmail();
    this.publicContactMobileNumber = publicSettings.getPublicContactMobileNumber();
    this.publicContactName = publicSettings.getPublicContactName();
  }

  public String getTitle() {

    return title;
  }

  public void setTitle(String title) {

    this.title = title;
  }

  public String getDescription() {

    return description;
  }

  public void setDescription(String description) {

    this.description = description;
  }

  public LocalDate getEndOfRegistrationDate() {

    return endOfRegistrationDate;
  }

  public void setEndOfRegistrationDate(LocalDate endOfRegistrationDate) {

    this.endOfRegistrationDate = endOfRegistrationDate;
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

  public PublicSettings toPublicSettingsDetached() {

    PublicSettings result = new PublicSettings(title, description, endOfRegistrationDate, registrationDeactivated);
    result.setPublicContactEmail(getPublicContactEmail());
    result.setPublicContactMobileNumber(getPublicContactMobileNumber());
    result.setPublicContactName(getPublicContactName());
    return result;
  }
}
