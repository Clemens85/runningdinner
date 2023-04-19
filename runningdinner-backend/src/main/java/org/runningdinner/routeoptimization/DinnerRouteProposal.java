package org.runningdinner.routeoptimization;

import java.util.List;
import java.util.UUID;

import org.runningdinner.participant.ParticipantAddress;

public class DinnerRouteProposal {
  
  private UUID teamId;
  
  private UUID mealId;
  
  private ParticipantAddress address;
  
  private List<UUID> guestTeams;
  
  private List<UUID> hostTeams;

  public UUID getTeamId() {
    return teamId;
  }

  public void setTeamId(UUID teamId) {
    this.teamId = teamId;
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

  public List<UUID> getGuestTeams() {
    return guestTeams;
  }

  public void setGuestTeams(List<UUID> guestTeams) {
    this.guestTeams = guestTeams;
  }

  public List<UUID> getHostTeams() {
    return hostTeams;
  }

  public void setHostTeams(List<UUID> hostTeams) {
    this.hostTeams = hostTeams;
  }
  
}
