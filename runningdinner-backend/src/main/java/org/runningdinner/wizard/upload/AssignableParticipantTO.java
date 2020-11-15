//
//package org.runningdinner.wizard.upload;
//
//import org.runningdinner.participant.Participant;
//import org.runningdinner.participant.rest.ParticipantTO;
//
//public class AssignableParticipantTO extends ParticipantTO {
//
//  private static final long serialVersionUID = 3284583283506375516L;
//
//  private boolean assignable;
//
//  private String teamId;
//
//  public AssignableParticipantTO() {
//    super();
//  }
//
//  public AssignableParticipantTO(Participant participant) {
//    super(participant);
//  }
//
//  public boolean isAssignable() {
//
//    return assignable;
//  }
//
//  public void setAssignable(boolean assignable) {
//
//    this.assignable = assignable;
//  }
//
//  public String getTeamId() {
//
//    return teamId;
//  }
//
//  public void setTeamId(String teamId) {
//
//    this.teamId = teamId;
//  }
//
//  public static AssignableParticipantTO fromParticipant(Participant participant, boolean assignable) {
//
//    AssignableParticipantTO result = new AssignableParticipantTO(participant);
//    result.setAssignable(assignable);
//    return result;
//  }
//  
//  public static AssignableParticipantTO fromParticipant(Participant participant, String teamId) {
//
//    AssignableParticipantTO result = fromParticipant(participant, true);
//    result.setTeamId(teamId);
//    return result;
//  }
//}
