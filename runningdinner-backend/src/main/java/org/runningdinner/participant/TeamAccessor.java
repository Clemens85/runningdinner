package org.runningdinner.participant;

import java.util.List;
import java.util.UUID;

import org.runningdinner.core.MealClassAccessor;
import org.springframework.util.Assert;

public final class TeamAccessor {

  private final Team wrappedTeam;

  private TeamAccessor(final Team wrappedTeam) {
    this.wrappedTeam = wrappedTeam;
  }

  public TeamAccessor setTeamNumber(int teamNumber) {
    wrappedTeam.setTeamNumber(teamNumber);
    return this;
  }
  
  public TeamAccessor removeAllTeamMembers() {
    wrappedTeam.removeAllTeamMembers();
    return this;
  }
  
  public TeamAccessor setId(UUID id) {
  	Assert.state(wrappedTeam.isNew(), "Can only set ID for team if it has none set so far, but ID was " + wrappedTeam.getId());
    wrappedTeam.setId(id);
    return this;
  }
  
  public TeamAccessor setMealClassId(UUID mealClassId) {
  	MealClassAccessor
  		.newAccessor(wrappedTeam.getMealClass())
  		.setId(mealClassId);
  	return this;
  }
  
	public void setTeamMemberIds(List<Participant> teamMembersWithIds) {
		List<Participant> wrappedTeamMembers = wrappedTeam.getTeamMembersOrdered();
		for (Participant wrappedTeamMember : wrappedTeamMembers) {
			Participant foundTeamMember = teamMembersWithIds
																			.stream()
																			.filter(p -> p.getParticipantNumber() == wrappedTeamMember.getParticipantNumber())
																			.findFirst()
																			.orElseThrow(() -> new IllegalStateException("Could not find Participant with nr " + wrappedTeamMember.getParticipantNumber() + " in " + teamMembersWithIds));
			ParticipantAccessor
				.newAccessor(wrappedTeamMember)
				.setId(foundTeamMember.getId());
		}
	}

  
  /**
   * Constructs a new accessor for the passed Team.
   *
   * @param team
   * @return
   */
  public static TeamAccessor newAccessor(Team team) {

    return new TeamAccessor(team);
  }

}
