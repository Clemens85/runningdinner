package org.runningdinner.event;

import java.util.List;

import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.springframework.context.ApplicationEvent;

public class TeamsHostChangedEvent extends ApplicationEvent {

	private static final long serialVersionUID = 4115345831036690681L;
	
  private RunningDinner runningDinner;

  private List<Team> teams;
	
	private Participant executingParticipant;
	
	private String comment;
	
	public TeamsHostChangedEvent(Object source,  List<Team> teams, RunningDinner runningDinner, Participant executingParticipant, String comment) {
    super(source);
    this.teams = teams;
    this.runningDinner = runningDinner;
    this.executingParticipant = executingParticipant;
    this.comment = comment;
  }
	
  public TeamsHostChangedEvent(Object source, List<Team> teams, RunningDinner runningDinner) {

    this(source, teams, runningDinner, null, null);
  }
	
  public Participant getExecutingParticipant() {
  
    return executingParticipant;
  }
  
  public String getComment() {
  
    return comment;
  }
  
  public RunningDinner getRunningDinner() {
    
    return runningDinner;
  }

  public List<Team> getTeams() {
    
    return teams;
  }

  public boolean isChangedByParticipant() {
    
    return executingParticipant != null;
  }
  
  @Override
  public String toString() {
    return "runningDinner=" + runningDinner + ", teams=" + teams + " " + executingParticipant;
  }

}