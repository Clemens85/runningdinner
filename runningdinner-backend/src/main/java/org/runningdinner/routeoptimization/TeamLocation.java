package org.runningdinner.routeoptimization;

import java.util.UUID;

import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.participant.ParticipantAddress;
import org.runningdinner.participant.TeamStatus;

import com.google.common.base.MoreObjects;

public class TeamLocation {
  
  private UUID id;
  
  private UUID mealId;
  
  private ParticipantAddress address;
  
  private GeocodingResult geodata;
  
  private TeamStatus teamStatus;
  
  protected TeamLocation() {
    
  }
  
  public TeamLocation(UUID id, UUID mealId, TeamStatus teamStatus, ParticipantAddress address, GeocodingResult geodata) {
    this.id = id;
    this.mealId = mealId;
    this.address = address;
    this.geodata = geodata;
    this.teamStatus = teamStatus;
  }

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public UUID getMealId() {
    return mealId;
  }

  public void setMealId(UUID mealId) {
    this.mealId = mealId;
  }

  public ParticipantAddress getAddress() {
    return address;
  }

  public void setAddress(ParticipantAddress address) {
    this.address = address;
  }

  public GeocodingResult getGeodata() {
    return geodata;
  }

  public void setGeodata(GeocodingResult geodata) {
    this.geodata = geodata;
  }
  
  public TeamStatus getTeamStatus() {
    return teamStatus;
  }

  public void setTeamStatus(TeamStatus teamStatus) {
    this.teamStatus = teamStatus;
  }

  @Override
  public String toString() {
    return MoreObjects.toStringHelper(this)
      .add("id", id)
      .add("meal", mealId)
      .add("address", address)
      .add("geodata", geodata)
      .toString();
  }
}
