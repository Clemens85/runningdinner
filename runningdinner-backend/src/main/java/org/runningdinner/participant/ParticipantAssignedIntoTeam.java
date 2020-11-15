package org.runningdinner.participant;


public class ParticipantAssignedIntoTeam {
  
  private String participantId;
  
  private String teamId;

  public ParticipantAssignedIntoTeam() {
    
  }

  public ParticipantAssignedIntoTeam(String participantId, String teamId) {
    this.participantId = participantId;
    this.teamId = teamId;
  }


  public String getParticipantId() {
  
    return participantId;
  }

  
  public ParticipantAssignedIntoTeam setParticipantId(String participantId) {
  
    this.participantId = participantId;
    return this;
  }

  
  public String getTeamId() {
  
    return teamId;
  }

  
  public ParticipantAssignedIntoTeam setTeamId(String teamId) {
  
    this.teamId = teamId;
    return this;
  }
  
  

}
