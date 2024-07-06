package org.runningdinner.participant.rest.dinnerroute;

import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.geocoder.HasGeocodingResult;

import java.util.UUID;

public class DinnerRouteAddressEntityTO extends GeocodingResult implements HasGeocodingResult {

  private UUID id;

  @Override
  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  @Override
  public boolean isNew() {
    return HasGeocodingResult.super.isNew();
  }

  @Override
  public boolean isSameId(UUID id) {
    return HasGeocodingResult.super.isSameId(id);
  }

  @Override
  public GeocodingResult getGeocodingResult() {
    return this;
  }
}
