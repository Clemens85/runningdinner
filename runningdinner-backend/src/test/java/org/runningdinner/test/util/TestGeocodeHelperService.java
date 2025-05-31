package org.runningdinner.test.util;

import java.util.List;

import org.runningdinner.geocoder.GeocodingResult;
import org.runningdinner.geocoder.GeocodingResult.GeocodingResultType;
import org.runningdinner.geocoder.GeocodingResult.GeocodingSyncStatus;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantRepository;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TestGeocodeHelperService {
	
	@Autowired
	private TeamService teamService;
	
	@Autowired
	private ParticipantRepository participantRepository;
	
	@Transactional
	public void fillAllTeamsWithTeamNumberGeocodes(String adminId) {
		List<Team> teams = teamService.findTeamArrangements(adminId, false);
		fillTeamsWithTeamNumberGeocodes(adminId, teams);
	}
	
	@Transactional
	public void fillTeamsWithTeamNumberGeocodes(String adminId, List<Team> teams) {
		List<Team> teamsToUpdate = teamService.findTeamsWithMembersOrdered(adminId, teams.stream().map(Team::getId).toList());
		List<Participant> modifiedTeamHosts = setGeocodesAsTeamNumbers(teamsToUpdate);
		participantRepository.saveAll(modifiedTeamHosts);
	}
	
	
	@Transactional
	public void fillTeamsWithInvalidGeocodes(String adminId, List<Team> teams) {
		List<Team> teamsToUpdate = teamService.findTeamsWithMembersOrdered(adminId, teams.stream().map(Team::getId).toList());
		for (Team teamToUpdate : teamsToUpdate) {
			Participant modifiedTeamHost = setGeocodeDataInvalid(teamToUpdate);
			participantRepository.save(modifiedTeamHost);
		}
	}
	
	static List<Participant> setGeocodesAsTeamNumbers(List<Team> teams) {
		return teams.stream().map(t -> setGeocodeAsTeamNumber(t)).toList();
	}
	
	static Participant setGeocodeAsTeamNumber(Team team) {
		return setGeocodeData(team, team.getTeamNumber(), team.getTeamNumber());
	}
	
	public static Participant setGeocodeData(Team team, double lat, double lng) {
		GeocodingResult result = team.getHostTeamMember().getGeocodingResult();
		result.setLat(lat);
		result.setLng(lng);
		result.setResultType(GeocodingResultType.EXACT);
		result.setSyncStatus(GeocodingSyncStatus.SYNCHRONIZED);
		return team.getHostTeamMember();
	}	
	
	public static Participant setGeocodeDataInvalid(Team team) {
		Participant hostTeamMember = setGeocodeData(team, -1, -1);
		hostTeamMember.getGeocodingResult().setResultType(GeocodingResultType.NONE);
		return hostTeamMember;
	}
}
