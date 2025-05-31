package org.runningdinner.geocoder.request;

import java.util.Objects;

import org.runningdinner.core.BaseAddress;

public class GeocodeRequestBody {

  private String street;
  private String streetNr;
  private String cityName;
  private String zip;

  protected GeocodeRequestBody() {
  }

  public GeocodeRequestBody(String street, String streetNr, String cityName, String zip) {
    this.street = street;
    this.streetNr = streetNr;
    this.cityName = cityName;
    this.zip = zip;
  }

	public GeocodeRequestBody(BaseAddress baseAddress) {
		this(baseAddress.getStreet(), baseAddress.getStreetNr(), baseAddress.getCityName(), baseAddress.getZip());
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

  public String getCityName() {
    return cityName;
  }

  public void setCityName(String cityName) {
    this.cityName = cityName;
  }

  public String getZip() {
    return zip;
  }

  public void setZip(String zip) {
    this.zip = zip;
  }

  @Override
  public boolean equals(Object o) {
    if (this == o) {
			return true;
		}
    if (!(o instanceof GeocodeRequestBody)) {
			return false;
		}
    GeocodeRequestBody that = (GeocodeRequestBody) o;
    return Objects.equals(street, that.street) &&
         	 Objects.equals(streetNr, that.streetNr) &&
         	 Objects.equals(cityName, that.cityName) &&
         	 Objects.equals(zip, that.zip);
  }

  @Override
  public int hashCode() {
    return Objects.hash(street, streetNr, cityName, zip);
  }

  @Override
  public String toString() {
    return "GeocodeRequestBody{" +
        "street='" + street + '\'' +
        ", streetNr='" + streetNr + '\'' +
        ", cityName='" + cityName + '\'' +
        ", zip='" + zip + '\'' +
        '}';
  }
}
