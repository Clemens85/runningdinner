package org.runningdinner.core;

import java.time.LocalDateTime;

import com.google.common.base.MoreObjects;
import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.participant.ParticipantAddress;

public class AfterPartyLocation {
  
  private String title;
  
  private ParticipantAddress address;
  
  private GeocodingResult geocode;
  
  private LocalDateTime time;

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public ParticipantAddress getAddress() {
    return address;
  }

  public void setAddress(ParticipantAddress address) {
    this.address = address;
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

  @Override
  public String toString() {
    return MoreObjects.toStringHelper(this)
      .add("title", title)
      .add("address", address)
      .add("geocode", geocode)
      .add("time", time)
      .toString();
  }
}
