package org.runningdinner.dinnerroute.distance;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import org.runningdinner.geocoder.GeocodingResult;

public class GeocodedAddressEntity extends GeocodingResult {

  @NotEmpty
  private String id;

  @NotNull
  private GeocodedAddressEntityIdType idType;

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public GeocodedAddressEntityIdType getIdType() {
    return idType;
  }

  public void setIdType(GeocodedAddressEntityIdType idType) {
    this.idType = idType;
  }
}
