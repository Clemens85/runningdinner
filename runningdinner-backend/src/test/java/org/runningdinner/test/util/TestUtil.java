
package org.runningdinner.test.util;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.runningdinner.admin.rest.BasicSettingsTO;
import org.runningdinner.core.IdentifierUtil;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.frontend.rest.RegistrationDataTO;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantAddress;
import org.runningdinner.participant.ParticipantName;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamCancellation;
import org.runningdinner.participant.rest.TeamParticipantsAssignmentTO;
import org.runningdinner.participant.rest.TeamPartnerWishRegistrationDataTO;
import org.runningdinner.wizard.BasicDetailsTO;

public class TestUtil {

  public static BasicDetailsTO newBasicDetails(String title, LocalDate date, String city) {

    return newBasicDetails(title, date, city, RegistrationType.CLOSED);
  }

  public static BasicDetailsTO newBasicDetails(String title, LocalDate date, String city, RegistrationType registrationType) {

    BasicDetailsTO result = new BasicDetailsTO();
    result.setTitle(title);
    result.setCity(city);
    result.setZip("79100");
    result.setDate(date);
    result.setRegistrationType(registrationType);
    result.setLanguageCode("de");
    return result;
  }
  
  public static BasicSettingsTO newBasicSettings(BasicDetailsTO basicDetails) {
    
    BasicSettingsTO result = new BasicSettingsTO();
    result.setBasicDetails(basicDetails);
    return result;
  }

  public static RegistrationDataTO createRegistrationData(String fullname, String email, ParticipantAddress address, int numberOfSeats) {

    RegistrationDataTO registrationData = new RegistrationDataTO();
    registrationData.setEmail(email);
    ParticipantName participantName = ParticipantName.newName().withCompleteNameString(fullname);
    registrationData.setFirstnamePart(participantName.getFirstnamePart());
    registrationData.setLastname(participantName.getLastname());
    registrationData.setNumSeats(numberOfSeats);
    registrationData.setCityName(address.getCityName());
    registrationData.setAddressRemarks(address.getRemarks());
    registrationData.setStreet(address.getStreet());
    registrationData.setStreetNr(address.getStreetNr());
    registrationData.setZip(address.getZip());
    return registrationData;
  }


  public static List<Participant> setMatchingTeamPartnerWish(List<Participant> teamMembers, 
                                                             int idx1, 
                                                             int idx2, 
                                                             String email1, 
                                                             String email2, 
                                                             boolean markParticipantActivated) {
    
    teamMembers.get(idx1).setEmail(email1);
    teamMembers.get(idx1).setTeamPartnerWishEmail(email2);
    teamMembers.get(idx2).setEmail(email2);
    teamMembers.get(idx2).setTeamPartnerWishEmail(email1);
    List<Participant> result = Arrays.asList(teamMembers.get(idx1), teamMembers.get(idx2));
    if (markParticipantActivated) {
      result.stream().forEach(p -> { 
        p.setActivationDate(LocalDateTime.now());
        p.setActivatedBy(p.getEmail());
      });
    }
    return result;
  }
  
  public static Team findTeamByTeamMemberEmail(List<Team> teams, String teamMemberEmail) {
    
    for (Team team : teams) {
      boolean found = team.getTeamMembers()
                        .stream()
                        .anyMatch(teamMember-> teamMember.getEmail().equalsIgnoreCase(teamMemberEmail));
      if (found) {
        return team;
      }
    }
    throw new RuntimeException("Team with " + teamMemberEmail + " not found in " + teams);
  }

  public static TeamParticipantsAssignmentTO newTeamParticipantsAssignment(Team team, Participant...participants) {
  	
  	TeamParticipantsAssignmentTO result = new TeamParticipantsAssignmentTO();
  	result.setTeamId(team.getId());
  	result.setParticipantIds(new ArrayList<>(IdentifierUtil.getIds(Arrays.asList(participants))));
  	return result;
  }

  public static TeamCancellation newCancellationWithoutReplacement(Team team) {
  	
  	TeamCancellation result = new TeamCancellation();
  	result.setTeamId(team.getId());
  	result.setDryRun(false);
  	result.setReplaceTeam(false);
  	return result;
  }
  
  public static TeamPartnerWishRegistrationDataTO newTeamPartnerWithRegistrationData(String firstname, String lastname) {
    return new TeamPartnerWishRegistrationDataTO(ParticipantName.newName().withFirstname(firstname).andLastname(lastname));
  }

  public static  ParticipantAddress newAddress() {
    return ParticipantAddress.parseFromCommaSeparatedString("Musterstraße 1, 47111 Musterstadt");
  }
  
}
