package org.runningdinner.participant.rest.dinnerroute;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import java.util.ArrayList;
import java.util.List;

public class GeocodedAddressEntityListTO {

  @NotNull
  @Valid
  private List<GeocodedAddressEntity> addressEntities = new ArrayList<>();

  public List<GeocodedAddressEntity> getAddressEntities() {
    return addressEntities;
  }

  public void setAddressEntities(List<GeocodedAddressEntity> addressEntities) {
    this.addressEntities = addressEntities;
  }
}
