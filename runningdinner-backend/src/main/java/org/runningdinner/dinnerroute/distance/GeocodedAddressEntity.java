package org.runningdinner.dinnerroute.distance;

import java.util.Objects;

import org.runningdinner.geocoder.GeocodingResult;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

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

  
  
  @Override
	public int hashCode() {
		return Objects.hash(id, idType);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj) {
			return true;
		}
		if (obj == null) {
			return false;
		}
		if (getClass() != obj.getClass()) {
			return false;
		}
		GeocodedAddressEntity other = (GeocodedAddressEntity) obj;
		return Objects.equals(id, other.id) && idType == other.idType;
	}

	@Override
	public String toString() {
  	return "ID " + id + " " + super.toString();
  }
}
