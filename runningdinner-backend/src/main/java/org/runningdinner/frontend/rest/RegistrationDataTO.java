package org.runningdinner.frontend.rest;

import java.io.Serializable;

import javax.validation.constraints.AssertTrue;
import javax.validation.constraints.Email;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import org.apache.commons.lang3.StringUtils;
import org.hibernate.validator.constraints.Length;
import org.hibernate.validator.constraints.SafeHtml;
import org.runningdinner.core.Gender;
import org.runningdinner.core.MealSpecifics;
import org.runningdinner.participant.Participant;

public class RegistrationDataTO implements Serializable {

	private static final long serialVersionUID = 1L;

	@NotNull
	@NotBlank
	@SafeHtml
	private String fullname;

  @NotBlank
  @Email
	private String email;

	@Length(max = 128)
	@SafeHtml
	private String mobile;

  @NotNull
	private Gender gender = Gender.UNDEFINED;

	@Max(120)
	private int age = Participant.UNDEFINED_AGE;

  @NotBlank
	@Length(max = 512)
	@SafeHtml
	private String streetWithNr;

  @NotBlank
	@Length(max = 16)
	@SafeHtml
	private String zip;

  @NotBlank
	@Length(max = 128)
	@SafeHtml
	private String city;

	@Length(max = 512)
	@SafeHtml
	private String addressRemarks;

	@Min(value = 0)
	@NotNull
	private int numberOfSeats;

	@Length(max = 512)
	@SafeHtml
	private String notes = StringUtils.EMPTY;

	@Length(max = 512)
  @Email
	private String teamPartnerWish;

	private boolean lactose;

	private boolean gluten;

	private boolean vegetarian;

	private boolean vegan;

	@Length(max = 512)
	@SafeHtml
	private String mealnote = StringUtils.EMPTY;
	
  @AssertTrue(message = "error.invalid.dataProcessingAcknowledged")
  private boolean dataProcessingAcknowledged;

	public String getFullname() {
		return fullname;
	}

	public void setFullname(String fullname) {
		this.fullname = fullname;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getMobile() {
		return mobile;
	}

	public void setMobile(String mobile) {
		this.mobile = mobile;
	}

	public Gender getGender() {
		return gender;
	}

	public void setGender(Gender gender) {
		this.gender = gender;
	}

	public Gender getGenderNotNull() {
		return this.getGender() != null ? this.getGender() : Gender.UNDEFINED;
	}

	public MealSpecifics getMealSpecifics() {
		return new MealSpecifics(this.isLactose(), this.isGluten(), this.isVegetarian(), this.isVegan(), this.getMealnote());
	}

	public int getAge() {
		return age;
	}

	public int getAgeNormalized() {
		if (age <= 0) {
			return Participant.UNDEFINED_AGE;
		}
		return age;
	}

	public void setAge(int age) {
		this.age = age;
	}

	public String getStreetWithNr() {
		return streetWithNr;
	}

	public void setStreetWithNr(String streetWithNr) {
		this.streetWithNr = streetWithNr;
	}

	public String getZip() {
		return zip;
	}

	public void setZip(String zip) {
		this.zip = zip;
	}

	public String getCity() {
		return city;
	}

	public void setCity(String city) {
		this.city = city;
	}

	public String getAddressRemarks() {
		return addressRemarks;
	}

	public void setAddressRemarks(String addressRemarks) {
		this.addressRemarks = addressRemarks;
	}

	public int getNumberOfSeats() {
		return numberOfSeats;
	}

	public void setNumberOfSeats(int numberOfSeats) {
		this.numberOfSeats = numberOfSeats;
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}

	public String getTeamPartnerWish() {
		return teamPartnerWish;
	}

	public void setTeamPartnerWish(String teamPartnerWish) {
		this.teamPartnerWish = teamPartnerWish;
	}

	public boolean isLactose() {
		return lactose;
	}

	public void setLactose(boolean lactose) {
		this.lactose = lactose;
	}

	public boolean isGluten() {
		return gluten;
	}

	public void setGluten(boolean gluten) {
		this.gluten = gluten;
	}

	public boolean isVegetarian() {
		return vegetarian;
	}

	public void setVegetarian(boolean vegetarian) {
		this.vegetarian = vegetarian;
	}

	public boolean isVegan() {
		return vegan;
	}

	public void setVegan(boolean vegan) {
		this.vegan = vegan;
	}

	public String getMealnote() {
		return mealnote;
	}

	public void setMealnote(String mealnote) {
		this.mealnote = mealnote;
	}
	
  public boolean isDataProcessingAcknowledged() {
  
    return dataProcessingAcknowledged;
  }

  public void setDataProcessingAcknowledged(boolean dataProcessingAcknowledged) {
  
    this.dataProcessingAcknowledged = dataProcessingAcknowledged;
  }

  @Override
	public String toString() {
		return "fullname=" + fullname + ", email=" + email;
	}

}
