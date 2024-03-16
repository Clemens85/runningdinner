package org.runningdinner.admin.deleted;

import java.time.LocalDate;

import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

import org.runningdinner.core.AbstractEntity;
import org.runningdinner.core.PublicSettings;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinner.RunningDinnerType;
import org.runningdinner.core.RunningDinnerInfo;

import com.google.common.base.MoreObjects;

@Entity
public class DeletedRunningDinner extends AbstractEntity implements RunningDinnerInfo {

  private static final long serialVersionUID = 1L;
  
  private String email;
  
  @Enumerated(EnumType.STRING)
  private RunningDinnerType runningDinnerType;
  
  private String title;
  
  private String city;
  
  private String zip;
  
  private String languageCode;
  
  private LocalDate date;
  
  @Enumerated(EnumType.STRING)
  private RegistrationType registrationType;
  
  @Embedded
  private PublicSettings publicSettings = new PublicSettings();

  protected DeletedRunningDinner() {
    
  }
  
  public DeletedRunningDinner(RunningDinner src) {
    
    this.city = src.getCity();
    this.date = src.getDate();
    this.email = src.getEmail();
    this.registrationType = src.getRegistrationType();
    this.runningDinnerType = src.getRunningDinnerType();
    this.title = src.getTitle();
    this.zip = src.getZip();
    this.languageCode = src.getLanguageCode();
    this.publicSettings = src.getPublicSettings() != null ? src.getPublicSettings().createDetachedClone() : new PublicSettings();
  }
  
  @Override
  public String getTitle() {

    return title;
  }

  @Override
  public LocalDate getDate() {

    return date;
  }

  @Override
  public String getCity() {

    return city;
  }

  @Override
  public String getZip() {

    return zip;
  }

  @Override
  public RegistrationType getRegistrationType() {

    return registrationType;
  }

  @Override
  public String getLanguageCode() {

    return languageCode;
  }
  
  public String getEmail() {
  
    return email;
  }

  public RunningDinnerType getRunningDinnerType() {
  
    return runningDinnerType;
  }
  
  public PublicSettings getPublicSettings() {
  
    return publicSettings;
  }

  @Override 
  public String toString() {

    return MoreObjects.toStringHelper(this)
            .add("email", email)
            .add("title", title)
            .add("date", date)
            .toString();
  }
}
