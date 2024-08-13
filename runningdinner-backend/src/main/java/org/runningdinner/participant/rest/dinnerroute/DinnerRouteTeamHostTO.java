
package org.runningdinner.participant.rest.dinnerroute;

import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.participant.Participant;

public class DinnerRouteTeamHostTO {

  private String firstnamePart;

  private String lastname;

  private String street;

  private String streetNr;

  private String zip;

  private String cityName;

  private String addressName;

  private String addressRemarks;

  private GeocodingResult geocodingResult;

  protected DinnerRouteTeamHostTO() {
    
    // NOP
  }
  
  public DinnerRouteTeamHostTO(Participant hostTeamMember) {

    this.firstnamePart = hostTeamMember.getName().getFirstnamePart();
    this.lastname = hostTeamMember.getName().getLastname();
    this.cityName = hostTeamMember.getAddress().getCityName();
    this.street = hostTeamMember.getAddress().getStreet();
    this.streetNr = hostTeamMember.getAddress().getStreetNr();
    this.zip = hostTeamMember.getAddress().getZip();
    this.addressRemarks = hostTeamMember.getAddress().getRemarks();
    this.addressName = hostTeamMember.getAddress().getAddressName();
    this.geocodingResult = hostTeamMember.getGeocodingResult();
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

  public GeocodingResult getGeocodingResult() {
    return geocodingResult;
  }

  public void setGeocodingResult(GeocodingResult geocodingResult) {
    this.geocodingResult = geocodingResult;
  }
}
