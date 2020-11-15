
package org.runningdinner.participant.rest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import org.hibernate.validator.constraints.Length;
import org.hibernate.validator.constraints.SafeHtml;
import org.runningdinner.common.rest.BaseTO;
import org.runningdinner.core.Gender;
import org.runningdinner.core.MealSpecifics;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.participant.AssignmentType;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantAddress;
import org.runningdinner.participant.ParticipantName;

public class ParticipantTO extends BaseTO {

  private static final long serialVersionUID = 1L;

  private int participantNumber;

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

  @NotBlank
  @Email
  @SafeHtml
  private String email;

  @SafeHtml
  private String mobileNumber;

  private int age;

  private int numSeats;

  private boolean vegetarian;

  private boolean lactose;

  private boolean vegan;

  private boolean gluten;

  @SafeHtml
  private String mealSpecificsNote;

  @NotNull
  private Gender gender;
  
  @SafeHtml
  private String notes;

  private UUID teamId;

  private AssignmentType assignmentType;
  
  private LocalDateTime activationDate;
  
  @Length(max = 512)
  @Email
  private String teamPartnerWish;

  private GeocodingResult geocodingResult;
  
  public ParticipantTO() {

  }

  public ParticipantTO(final Participant participant) {
    super(participant);
    this.age = participant.getAge();
    this.email = participant.getEmail();
    this.mobileNumber = participant.getMobileNumber();
    this.numSeats = participant.getNumSeats();
    this.participantNumber = participant.getParticipantNumber();
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
    this.mealSpecificsNote = mealSpecifics.getNote();
    
    this.notes = participant.getNotes();
    
    this.teamId = participant.getTeamId();
    this.assignmentType = participant.getAssignmentType();
    
    this.activationDate = participant.getActivationDate();
    
    this.teamPartnerWish = participant.getTeamPartnerWish();

    this.geocodingResult = participant.getGeocodingResult();
  }

  public int getParticipantNumber() {

    return participantNumber;
  }

  public void setParticipantNumber(int participantNumber) {

    this.participantNumber = participantNumber;
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

  public void setAge(int age) {

    this.age = age;
  }

  public int getNumSeats() {

    return numSeats;
  }

  public void setNumSeats(int numSeats) {

    this.numSeats = numSeats;
  }

  public boolean isVegetarian() {

    return vegetarian;
  }

  public void setVegetarian(boolean vegetarian) {

    this.vegetarian = vegetarian;
  }

  public boolean isLactose() {

    return lactose;
  }

  public void setLactose(boolean lactose) {

    this.lactose = lactose;
  }

  public boolean isVegan() {

    return vegan;
  }

  public void setVegan(boolean vegan) {

    this.vegan = vegan;
  }

  public boolean isGluten() {

    return gluten;
  }

  public void setGluten(boolean gluten) {

    this.gluten = gluten;
  }

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

  public AssignmentType getAssignmentType() {

    return assignmentType;
  }

  public void setAssignmentType(AssignmentType assignmentType) {

    this.assignmentType = assignmentType;
  }
  
  public String getNotes() {
  
    return notes;
  }
  
  public void setNotes(String notes) {
  
    this.notes = notes;
  }

  public UUID getTeamId() {
  
    return teamId;
  }
  
  public LocalDateTime getActivationDate() {
  
    return activationDate;
  }

  public void setActivationDate(LocalDateTime activationDate) {
  
    this.activationDate = activationDate;
  }
  
  public String getTeamPartnerWish() {
  
    return teamPartnerWish;
  }
  
  public void setTeamPartnerWish(String teamPartnerWish) {
  
    this.teamPartnerWish = teamPartnerWish;
  }

  public GeocodingResult getGeocodingResult() {

    return geocodingResult;
  }

  public void setGeocodingResult(GeocodingResult geocodingResult) {

    this.geocodingResult = geocodingResult;
  }

  public static List<ParticipantTO> convertParticipantList(final Collection<Participant> participants) {

    List<ParticipantTO> result = new ArrayList<>(participants.size());
    for (Participant p : participants) {
      result.add(new ParticipantTO(p));
    }
    return result;
  }

  public Participant toParticipant() {

    Participant result = new Participant(this.participantNumber);

    result.setAge(getAge());
    result.setEmail(getEmail());
    result.setMobileNumber(getMobileNumber());
    result.setNumSeats(getNumSeats());

    ParticipantAddress address = new ParticipantAddress(getStreet(), getStreetNr(), getZip());
    address.setCityName(getCityName());
    address.setRemarks(getAddressRemarks());
    result.setAddress(address);

    result.setGender(getGender());

    result.setName(ParticipantName.newName().withFirstname(getFirstnamePart()).andLastname(getLastname()));

    result.setMealSpecifics(new MealSpecifics(lactose, gluten, vegetarian, vegan, mealSpecificsNote));
    
    result.setNotes(getNotes());
    
    result.setActivationDate(getActivationDate());
    
    result.setTeamPartnerWish(getTeamPartnerWish());

    result.setGeocodingResult(getGeocodingResult());

    return result;
  }

  @Override
  public String toString() {

    return "participantNumber=" + participantNumber + ", firstnamePart=" + firstnamePart + ", lastname=" + lastname;
  }

}
