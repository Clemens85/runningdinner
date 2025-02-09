
package org.runningdinner.wizard;

import java.io.Serializable;
import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.validator.constraints.SafeHtml;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinnerInfo;

public class BasicDetailsTO implements RunningDinnerInfo, Serializable {

  private static final long serialVersionUID = 1L;

  @NotBlank
  @SafeHtml
  @Size(max = 255)
  private String title;

  @NotBlank
  @SafeHtml
  @Size(max = 255)
  private String city;

  @NotBlank
  @SafeHtml
  @Size(max = 16)
  private String zip;

  @NotNull
  private LocalDate date;

  @NotNull
  private RegistrationType registrationType;

  @NotBlank
  @SafeHtml
  @Size(max = 16)
  private String languageCode;

  @SafeHtml
  @Size(max = 1024)
  private String zipRestrictions;

  public BasicDetailsTO() {

  }

  public BasicDetailsTO(RunningDinnerInfo runningDinnerInfo) {
    this.title = runningDinnerInfo.getTitle();
    this.city = runningDinnerInfo.getCity();
    this.zip = runningDinnerInfo.getZip();
    this.date = runningDinnerInfo.getDate();
    this.registrationType = runningDinnerInfo.getRegistrationType();
    this.languageCode = runningDinnerInfo.getLanguageCode();
    this.zipRestrictions = runningDinnerInfo.getZipRestrictions();
  }

  @Override
  public String getTitle() {

    return title;
  }

  public void setTitle(String title) {

    this.title = title;
  }

  @Override
  public String getCity() {

    return city;
  }

  public void setCity(String city) {

    this.city = city;
  }

  @Override
  public String getZip() {

    return zip;
  }

  public void setZip(String zip) {

    this.zip = zip;
  }

  @Override
  public LocalDate getDate() {

    return date;
  }

  public void setDate(LocalDate date) {

    this.date = date;
  }
  
  @Override
  public String getLanguageCode() {
  
    return StringUtils.trim(StringUtils.lowerCase(languageCode));
  }

  public void setLanguageCode(String languageCode) {
  
    this.languageCode = languageCode;
  }

  @Override
  public RegistrationType getRegistrationType() {

    return registrationType;
  }

  public void setRegistrationType(RegistrationType registrationType) {

    this.registrationType = registrationType;
  }

  @Override
  public String getZipRestrictions() {
    return zipRestrictions;
  }

  public void setZipRestrictions(String zipRestrictions) {
    this.zipRestrictions = zipRestrictions;
  }
}
