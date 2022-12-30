package org.runningdinner.core;

import java.time.LocalDateTime;

import javax.persistence.AttributeOverride;
import javax.persistence.AttributeOverrides;
import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.persistence.Embedded;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

import org.hibernate.validator.constraints.Length;
import org.hibernate.validator.constraints.SafeHtml;
import org.runningdinner.geocoder.GeocodingResult;

import com.google.common.base.MoreObjects;

@Embeddable
public class AfterPartyLocation {
  
//  @Embedded
//  @AttributeOverrides({
//    @AttributeOverride(name = "street", column = @Column(name = "afterPartyLocationStreet")),
//    @AttributeOverride(name = "streetNr", column = @Column(name = "afterPartyLocationStreetNr")),
//    @AttributeOverride(name = "zip", column = @Column(name = "afterPartyLocationZip")),
//    @AttributeOverride(name = "cityName", column = @Column(name = "afterPartyLocationCityName")),
//    @AttributeOverride(name = "addressName", column = @Column(name = "afterPartyLocationAddressName")),
//    @AttributeOverride(name = "remarks", column = @Column(name = "afterPartyLocationRemarks"))
//  })
//  private ParticipantAddress address;
  
 
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
  private GeocodingResult geocode = new GeocodingResult();
  
  @Column(columnDefinition = "TIMESTAMP WITHOUT TIME ZONE")
  @NotNull
  private LocalDateTime time;

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

  public GeocodingResult getGeocode() {
    return geocode;
  }

  public void setGeocode(GeocodingResult geocode) {
    this.geocode = geocode;
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
  
  public AfterPartyLocation createDetachedClone() {
    AfterPartyLocation result = new AfterPartyLocation();
    copyValues(this, result);
    return result;
  }

  public static void copyValues(AfterPartyLocation src, AfterPartyLocation dest) {
    dest.setAddressName(src.getAddressName());
    dest.setAddressRemarks(src.getAddressRemarks());
    dest.setCityName(src.getCityName());
    dest.setGeocode(src.getGeocode());
    dest.setStreet(src.getStreet());
    dest.setStreetNr(src.getStreetNr());
    dest.setTime(src.getTime());
    dest.setZip(src.getZip());
  }

  @Override
  public String toString() {
    return MoreObjects.toStringHelper(this)
      .add("address", street)
      .add("geocode", geocode)
      .add("time", time)
      .toString();
  }
}
