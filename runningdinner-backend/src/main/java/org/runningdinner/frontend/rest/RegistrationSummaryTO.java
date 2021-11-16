package org.runningdinner.frontend.rest;

import java.io.Serializable;

import org.hibernate.validator.constraints.SafeHtml;
import org.runningdinner.core.Gender;
import org.runningdinner.core.MealSpecifics;
import org.runningdinner.frontend.RegistrationSummary;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantAddress;
import org.runningdinner.participant.partnerwish.TeamPartnerWishState;

public class RegistrationSummaryTO implements Serializable {

	private static final long serialVersionUID = 1L;

	@SafeHtml
	private String fullname;

	@SafeHtml
	private String email;

	@SafeHtml
	private String mobile;

	private Gender gender;

	private int age = Participant.UNDEFINED_AGE;

	private boolean ageSpecified;

	@SafeHtml
	private String streetWithNr;

	@SafeHtml
	private String zipWithCity;

	@SafeHtml
	private String addressRemarks;

	private int numberOfSeats;

	private boolean canHost;

	@SafeHtml
	private String notes;

	@SafeHtml
	private String teamPartnerWish;

	private MealSpecifics mealSpecifics;

  private TeamPartnerWishState teamPartnerWishState;

	public RegistrationSummaryTO() {

	}

	public RegistrationSummaryTO(RegistrationSummary registrationSummary) {

		Participant participant = registrationSummary.getParticipant();
		boolean canHost = registrationSummary.isCanHost();

		ParticipantAddress address = participant.getAddress();
		this.addressRemarks = address.getRemarks();
		this.streetWithNr = address.getStreetWithNr();
		this.zipWithCity = address.getZipWithCity();

		this.setAge(participant.getAge());

		this.canHost = canHost;

		this.email = participant.getEmail();

		this.fullname = participant.getName().getFullnameFirstnameFirst();

		this.gender = participant.getGender();

		MealSpecifics mealSpecifics = participant.getMealSpecifics();
		if (MealSpecifics.NONE.equals(mealSpecifics)) {
			this.mealSpecifics = null;
		}
		else {
			this.mealSpecifics = mealSpecifics;
		}

		this.mobile = participant.getMobileNumber();

		this.notes = participant.getNotes();
		this.numberOfSeats = participant.getNumSeats();

		this.teamPartnerWish = participant.getTeamPartnerWish();
		
		this.teamPartnerWishState = registrationSummary.getTeamPartnerWishState();
	}

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

	public int getAge() {
		return age;
	}

	public void setAge(int age) {
		this.age = age;
		this.ageSpecified = age != Participant.UNDEFINED_AGE;
	}

	public String getStreetWithNr() {
		return streetWithNr;
	}

	public void setStreetWithNr(String streetWithNr) {
		this.streetWithNr = streetWithNr;
	}

	public String getZipWithCity() {
		return zipWithCity;
	}

	public void setZipWithCity(String zipWithCity) {
		this.zipWithCity = zipWithCity;
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

	public boolean isCanHost() {
		return canHost;
	}

	public void setCanHost(boolean canHost) {
		this.canHost = canHost;
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}

	public boolean isAgeSpecified() {
		return ageSpecified;
	}

	public void setAgeSpecified(boolean ageSpecified) {
		this.ageSpecified = ageSpecified;
	}

	public String getTeamPartnerWish() {
		return teamPartnerWish;
	}

	public void setTeamPartnerWish(String teamPartnerWish) {
		this.teamPartnerWish = teamPartnerWish;
	}

	public MealSpecifics getMealSpecifics() {
		return mealSpecifics;
	}

	public void setMealSpecifics(MealSpecifics mealSpecifics) {
		this.mealSpecifics = mealSpecifics;
	}
	
  public TeamPartnerWishState getTeamPartnerWishState() {
  
    return teamPartnerWishState;
  }
  
  public void setTeamPartnerWishState(TeamPartnerWishState teamPartnerWishState) {
  
    this.teamPartnerWishState = teamPartnerWishState;
  }

  @Override
	public String toString() {
		return "fullname=" + fullname + ", email=" + email;
	}

}
