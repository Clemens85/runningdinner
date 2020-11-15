
package org.runningdinner.participant.rest;

import java.util.List;
import java.util.stream.Collectors;

import org.runningdinner.participant.TeamCancellationResult;

public class TeamCancellationResultTO {

  private TeamTO team;

  private List<ParticipantTO> removedParticipants;

  private boolean dinnerRouteMessagesSent;

  private List<TeamTO> affectedGuestTeams;

  private List<TeamTO> affectedHostTeams;

  protected TeamCancellationResultTO() {

  }

  public TeamCancellationResultTO(TeamCancellationResult teamCancellationResult) {
    team = new TeamTO(teamCancellationResult.getTeam());
    removedParticipants = ParticipantTO.convertParticipantList(teamCancellationResult.getRemovedParticipants());
    dinnerRouteMessagesSent = teamCancellationResult.isDinnerRouteMessagesSent();
    affectedGuestTeams = TeamTO.convertTeamList(teamCancellationResult.getAffectedGuestTeams());
    affectedHostTeams = teamCancellationResult.getAffectedHostTeams().stream().map(h -> new HostTeamTO(h.getTeam())).collect(Collectors.toList());
  }

  public TeamTO getTeam() {

    return team;
  }

  public List<ParticipantTO> getRemovedParticipants() {

    return removedParticipants;
  }

  public boolean isDinnerRouteMessagesSent() {

    return dinnerRouteMessagesSent;
  }

  public List<TeamTO> getAffectedGuestTeams() {

    return affectedGuestTeams;
  }
  
  public List<TeamTO> getAffectedHostTeams() {
  
    return affectedHostTeams;
  }
  
}
