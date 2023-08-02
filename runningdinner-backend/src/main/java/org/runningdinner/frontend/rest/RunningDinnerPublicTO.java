
package org.runningdinner.frontend.rest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

import org.runningdinner.admin.rest.MealTO;
import org.runningdinner.core.AfterPartyLocation;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinner.RunningDinnerType;
import org.runningdinner.core.util.NumberUtil;
import org.runningdinner.payment.paymentoptions.PaymentOptions;
import org.runningdinner.payment.paymentoptions.rest.PaymentOptionsTO;
import org.runningdinner.wizard.PublicSettingsTO;

public class RunningDinnerPublicTO {

  private PublicSettingsTO publicSettings;
  
  private AfterPartyLocation afterPartyLocation;

  private LocalDate date;

  private String city;

  private String zip;

  private List<MealTO> meals;

  private String adminEmail;
  
  private boolean registrationDateExpired;
  
  private RunningDinnerType runningDinnerType;
  
  private String languageCode;
  
  private boolean teamPartnerWishDisabled;
  
  private PaymentOptionsTO paymentOptions;

  public RunningDinnerPublicTO() {
  }

  public RunningDinnerPublicTO(RunningDinner runningDinner, PaymentOptions incomingPaymentOptions, Locale locale, LocalDate now) {
    this.date = runningDinner.getDate();
    this.city = runningDinner.getCity();
    this.zip = runningDinner.getZip();
    this.publicSettings = new PublicSettingsTO(runningDinner.getPublicSettings(), true);
    this.meals = MealTO.fromMeals(runningDinner.getConfiguration().getMealClasses());
    this.registrationDateExpired = !runningDinner.canRegistrate(now);
    this.adminEmail = runningDinner.getEmail();
    this.languageCode = runningDinner.getLanguageCode();
    this.runningDinnerType = runningDinner.getRunningDinnerType();
    this.teamPartnerWishDisabled = runningDinner.getConfiguration().isTeamPartnerWishDisabled();
    this.afterPartyLocation = runningDinner.getAfterPartyLocation().orElse(null);
    if (incomingPaymentOptions != null) {
      this.paymentOptions = newPaymentOptionsTO(incomingPaymentOptions, locale);
    }
  }

  private static PaymentOptionsTO newPaymentOptionsTO(PaymentOptions incomingPaymentOptions, Locale locale) {
    
    BigDecimal pricePerRegistration = incomingPaymentOptions.getPricePerRegistration();
    return new PaymentOptionsTO(incomingPaymentOptions, NumberUtil.getFormattedAmountValue(pricePerRegistration, locale));
  }

  public PublicSettingsTO getPublicSettings() {

    return publicSettings;
  }

  public void setPublicSettings(PublicSettingsTO publicSettings) {

    this.publicSettings = publicSettings;
  }

  public LocalDate getDate() {

    return date;
  }

  public void setDate(LocalDate date) {

    this.date = date;
  }

  public String getCity() {

    return city;
  }

  public void setCity(String city) {

    this.city = city;
  }

  public String getZip() {

    return zip;
  }

  public void setZip(String zip) {

    this.zip = zip;
  }

  public List<MealTO> getMeals() {

    return meals;
  }

  public void setMeals(List<MealTO> meals) {

    this.meals = meals;
  }

  public boolean isRegistrationDateExpired() {

    return registrationDateExpired;
  }

  public void setRegistrationDateExpired(boolean registrationDateExpired) {

    this.registrationDateExpired = registrationDateExpired;
  }
  
  public String getAdminEmail() {
  
    return adminEmail;
  }

  public void setAdminEmail(String adminEmail) {
  
    this.adminEmail = adminEmail;
  }
  
  public RunningDinnerType getRunningDinnerType() {
  
    return runningDinnerType;
  }
  
  public void setRunningDinnerType(RunningDinnerType runningDinnerType) {
  
    this.runningDinnerType = runningDinnerType;
  }
  
  public String getLanguageCode() {
  
    return languageCode;
  }
  
  public void setLanguageCode(String languageCode) {
  
    this.languageCode = languageCode;
  }
  
  public boolean isTeamPartnerWishDisabled() {
  
    return teamPartnerWishDisabled;
  }
  
  public void setTeamPartnerWishDisabled(boolean teamPartnerWishDisabled) {
  
    this.teamPartnerWishDisabled = teamPartnerWishDisabled;
  }

  public AfterPartyLocation getAfterPartyLocation() {
    return afterPartyLocation;
  }

  public void setAfterPartyLocation(AfterPartyLocation afterPartyLocation) {
    this.afterPartyLocation = afterPartyLocation;
  }
  
  public PaymentOptionsTO getPaymentOptions() {
    return paymentOptions;
  }

  public void setPaymentOptions(PaymentOptionsTO paymentOptions) {
    this.paymentOptions = paymentOptions;
  }

  @Override
  public String toString() {

    return "publicSettings=" + publicSettings + ", date=" + date;
  }

}
