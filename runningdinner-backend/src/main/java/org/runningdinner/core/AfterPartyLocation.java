package org.runningdinner.core;

import java.time.LocalDateTime;

import org.hibernate.validator.constraints.Length;
import org.hibernate.validator.constraints.SafeHtml;
import org.runningdinner.geocoder.GeocodingResult;

import com.google.common.base.MoreObjects;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Embeddable
public class AfterPartyLocation implements BaseAddress {

  @SafeHtml
  @NotBlank
  @Length(max = 512)
  private String title;

  @SafeHtml
  @NotBlank
  @Length(max = 256)
  private String street;
  
  @SafeHtml
  @NotBlank
  @Length(max = 128)
  private String streetNr;

  @SafeHtml
  @NotBlank
  @Length(max = 64)
  private String zip;
 
  @SafeHtml
  @NotBlank
  @Length(max = 256)
  private String cityName;

  @SafeHtml
  @Length(max = 256)
  private String addressName;

  @SafeHtml
  @Length(max = 512)
  private String addressRemarks;
  
  @Embedded
  @AttributeOverrides({
    @AttributeOverride(name = "lat", column = @Column(name = "afterPartyLocationLat", length = 64)),
    @AttributeOverride(name = "lng", column = @Column(name = "afterPartyLocationLng", length = 64)),
    @AttributeOverride(name = "formattedAddress", column = @Column(name = "afterPartyLocationFormattedAddress", length = 512)),
    @AttributeOverride(name = "resultType", column = @Column(name = "afterPartyLocationResultType", length = 32))
  })
  private GeocodingResult geocodingResult = new GeocodingResult();
  
  @Column(columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
  @NotNull
  private LocalDateTime time;

  @Override
	public String getStreet() {
    return street;
  }

  public void setStreet(String street) {
    this.street = street;
  }

  @Override
	public String getStreetNr() {
    return streetNr;
  }

  public void setStreetNr(String streetNr) {
    this.streetNr = streetNr;
  }

  @Override
	public String getZip() {
    return zip;
  }

  public void setZip(String zip) {
    this.zip = zip;
  }

  @Override
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

  public LocalDateTime getTime() {
    return time;
  }

  public void setTime(LocalDateTime time) {
    this.time = time;
  }
  
  public boolean isDefined() {
    return time != null;
  }


  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public AfterPartyLocation createDetachedClone() {
    AfterPartyLocation result = new AfterPartyLocation();
    copyValues(this, result);
    return result;
  }

  public static void copyValues(AfterPartyLocation src, AfterPartyLocation dest) {
    dest.setAddressName(src.getAddressName());
    dest.setAddressRemarks(src.getAddressRemarks());
    dest.setCityName(src.getCityName());
    dest.setGeocodingResult(src.getGeocodingResult());
    dest.setStreet(src.getStreet());
    dest.setStreetNr(src.getStreetNr());
    dest.setTime(src.getTime());
    dest.setZip(src.getZip());
    dest.setTitle(src.getTitle());
  }

  @Override
  public String toString() {
    return MoreObjects.toStringHelper(this)
      .add("address", street)
      .add("geocodingResult", geocodingResult)
      .add("time", time)
      .toString();
  }
}
