package org.runningdinner.participant.rest.dinnerroute;

import java.io.Serializable;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.core.AfterPartyLocation;
import org.runningdinner.core.IdentifierUtil;
import org.runningdinner.mail.formatter.FormatterUtil;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.rest.TeamTO;

public class DinnerRouteTO implements Serializable {

  private static final long serialVersionUID = 1L;
	
  private TeamTO currentTeam;

  private List<DinnerRouteTeamTO> teams;
	
  private String mealSpecificsOfGuestTeams = StringUtils.EMPTY;

  private AfterPartyLocation afterPartyLocation;
	
  protected DinnerRouteTO() {
    
  }

  protected DinnerRouteTO(Team currentTeam, List<Team> incomingTeams, String mealSpecificsOfGuestTeams, AfterPartyLocation afterPartyLocation) {
    this.currentTeam = new TeamTO(currentTeam);
    this.teams = mapTeams(incomingTeams);
    this.mealSpecificsOfGuestTeams = mealSpecificsOfGuestTeams;
    this.afterPartyLocation = afterPartyLocation;
  }

  public static DinnerRouteTO newInstance(UUID currentTeamId, List<Team> dinnerRouteTeams, String mealSpecificsOfGuestTeams, Optional<AfterPartyLocation> afterPartyLocation) {
    
    Team currentTeam = IdentifierUtil.filterListForIdMandatory(dinnerRouteTeams, currentTeamId); 
    return new DinnerRouteTO(currentTeam, dinnerRouteTeams, mealSpecificsOfGuestTeams, afterPartyLocation.orElse(null));
  }
  
  public List<DinnerRouteTeamTO> getTeams() {
  
    return teams;
  }

  public TeamTO getCurrentTeam() {
  
    return currentTeam;
  }
  
  public String getMealSpecificsOfGuestTeams() {
  
    return mealSpecificsOfGuestTeams;
  }
  
  public AfterPartyLocation getAfterPartyLocation() {

    return afterPartyLocation;
  }

  public DinnerRouteTO withMealSpecificsInHtmlFormat() {
    
    DinnerRouteTO result = new DinnerRouteTO();
    result.currentTeam = this.currentTeam;
    result.teams = this.teams;
    result.mealSpecificsOfGuestTeams = FormatterUtil.getHtmlFormattedMessage(this.mealSpecificsOfGuestTeams);
    result.afterPartyLocation = this.afterPartyLocation;
    return result;
  }
  
  private static List<DinnerRouteTeamTO> mapTeams(List<Team> incomingTeams) {
    
   return incomingTeams
           .stream()
           .map(incomingTeam -> new DinnerRouteTeamTO(incomingTeam))
           .collect(Collectors.toList());
  }
  
  
}
