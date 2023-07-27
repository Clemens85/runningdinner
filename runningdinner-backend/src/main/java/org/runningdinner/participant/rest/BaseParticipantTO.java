package org.runningdinner.participant.rest;

import javax.validation.Valid;
import javax.validation.constraints.Email;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import org.hibernate.validator.constraints.Length;
import org.hibernate.validator.constraints.SafeHtml;
import org.runningdinner.common.rest.BaseTO;
import org.runningdinner.core.Gender;
import org.runningdinner.core.MealSpecifics;
import org.runningdinner.participant.MealSpecificsAware;
import org.runningdinner.participant.Participant;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.google.common.base.MoreObjects;

public class BaseParticipantTO extends BaseTO implements MealSpecificsAware {

  @NotBlank
  @SafeHtml
  private String firstnamePart;

  @NotBlank
  @SafeHtml
  private String lastname;

  @NotBlank
  @SafeHtml
  private String street;

  @NotBlank
  @SafeHtml
  private String streetNr;

  @NotBlank
  @Length
  @SafeHtml
  private String zip;

  @SafeHtml
  private String cityName;

  @SafeHtml
  private String addressName;

  @SafeHtml
  private String addressRemarks;

  @SafeHtml
  private String country;

  @Min(value = 0)
  @NotNull
  private int numSeats;
  
  @NotBlank
  @Email
  @SafeHtml
  private String email;

  @SafeHtml
  private String mobileNumber;

  private int age;

  private boolean vegetarian;

  private boolean lactose;

  private boolean vegan;

  private boolean gluten;

  @SafeHtml
  private String notes;

  @SafeHtml
  private String mealSpecificsNote;

  @NotNull
  private Gender gender;

  @Length(max = 512)
  @Email
  private String teamPartnerWishEmail;
  
  @Valid
  private TeamPartnerWishRegistrationDataTO teamPartnerWishRegistrationData;

  public BaseParticipantTO() {
  }

  public BaseParticipantTO(Participant participant) {
    super(participant);
    this.setAge(participant.getAge());
    this.email = participant.getEmail();
    this.mobileNumber = participant.getMobileNumber();
    this.firstnamePart = participant.getName().getFirstnamePart();
    this.lastname = participant.getName().getLastname();
    this.cityName = participant.getAddress().getCityName();
    this.street = participant.getAddress().getStreet();
    this.streetNr = participant.getAddress().getStreetNr();
    this.zip = participant.getAddress().getZip();
    this.addressRemarks = participant.getAddress().getRemarks();
    this.gender = participant.getGender();

    MealSpecifics mealSpecifics = participant.getMealSpecifics();
    this.vegan = mealSpecifics.isVegan();
    this.vegetarian = mealSpecifics.isVegetarian();
    this.gluten = mealSpecifics.isGluten();
    this.lactose = mealSpecifics.isLactose();
    this.mealSpecificsNote = mealSpecifics.getMealSpecificsNote();

    this.numSeats = participant.getNumSeats();
    this.teamPartnerWishEmail = participant.getTeamPartnerWishEmail();

    this.notes = participant.getNotes();
  }

  public String getFirstnamePart() {

    return firstnamePart;
  }

  public void setFirstnamePart(String firstnamePart) {

    this.firstnamePart = firstnamePart;
  }

  public String getLastname() {

    return lastname;
  }

  public void setLastname(String lastname) {

    this.lastname = lastname;
  }

  public String getStreet() {

    return street;
  }

  public void setStreet(String street) {

    this.street = street;
  }

  public String getStreetNr() {

    return streetNr;
  }

  public void setStreetNr(String streetNr) {

    this.streetNr = streetNr;
  }

  public String getZip() {

    return zip;
  }

  public void setZip(String zip) {

    this.zip = zip;
  }

  public String getCityName() {

    return cityName;
  }

  public void setCityName(String cityName) {

    this.cityName = cityName;
  }

  public String getAddressName() {

    return addressName;
  }

  public void setAddressName(String addressName) {

    this.addressName = addressName;
  }

  public String getAddressRemarks() {

    return addressRemarks;
  }

  public void setAddressRemarks(String addressRemarks) {

    this.addressRemarks = addressRemarks;
  }

  public String getCountry() {

    return country;
  }

  public void setCountry(String country) {

    this.country = country;
  }

  public String getEmail() {

    return email;
  }

  public void setEmail(String email) {

    this.email = email;
  }

  public String getMobileNumber() {

    return mobileNumber;
  }

  public void setMobileNumber(String mobileNumber) {

    this.mobileNumber = mobileNumber;
  }

  public int getAge() {

    return age;
  }

  @JsonIgnore
  public int getAgeNormalized() {
    if (getAge() <= 0) {
      return Participant.UNDEFINED_AGE;
    }
    return getAge();
  }
  
  public void setAge(int age) {

    this.age = age;
  }

  @Override
  public boolean isVegetarian() {

    return vegetarian;
  }

  public void setVegetarian(boolean vegetarian) {

    this.vegetarian = vegetarian;
  }

  @Override
  public boolean isLactose() {

    return lactose;
  }

  public void setLactose(boolean lactose) {

    this.lactose = lactose;
  }

  @Override
  public boolean isVegan() {

    return vegan;
  }

  public void setVegan(boolean vegan) {

    this.vegan = vegan;
  }

  @Override
  public boolean isGluten() {

    return gluten;
  }

  public void setGluten(boolean gluten) {

    this.gluten = gluten;
  }

  @Override
  public String getMealSpecificsNote() {

    return mealSpecificsNote;
  }

  public void setMealSpecificsNote(String mealSpecificsNote) {

    this.mealSpecificsNote = mealSpecificsNote;
  }

  public Gender getGender() {

    return gender;
  }

  public void setGender(Gender gender) {

    this.gender = gender;
  }
  
  public String getTeamPartnerWishEmail() {

    return teamPartnerWishEmail;
  }

  public void setTeamPartnerWishEmail(String teamPartnerWishEmail) {

    this.teamPartnerWishEmail = teamPartnerWishEmail;
  }

  public String getNotes() {

    return notes;
  }

  public void setNotes(String notes) {

    this.notes = notes;
  }

  public int getNumSeats() {
    return numSeats;
  }

  public void setNumSeats(int numSeats) {
    this.numSeats = numSeats;
  }

  public TeamPartnerWishRegistrationDataTO getTeamPartnerWishRegistrationData() {
    return teamPartnerWishRegistrationData;
  }

  public void setTeamPartnerWishRegistrationData(TeamPartnerWishRegistrationDataTO teamPartnerWishRegistrationData) {
    this.teamPartnerWishRegistrationData = teamPartnerWishRegistrationData;
  }

  @Override
  public String toString() {
    return MoreObjects.toStringHelper(this)
      .add("firstnamePart", firstnamePart)
      .add("lastname", lastname)
      .toString();
  }
}
