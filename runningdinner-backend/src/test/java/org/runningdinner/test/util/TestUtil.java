
package org.runningdinner.test.util;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.File;
import java.net.URISyntaxException;
import java.net.URL;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

import org.runningdinner.admin.rest.BasicSettingsTO;
import org.runningdinner.contract.Contract;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.ParticipantGenerator;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinner.RunningDinnerType;
import org.runningdinner.core.RunningDinnerConfig;
import org.runningdinner.core.RunningDinnerInfo;
import org.runningdinner.frontend.rest.RegistrationDataV2TO;
import org.runningdinner.initialization.CreateRunningDinnerInitializationService;
import org.runningdinner.mail.mailserversettings.MailServerSettingsImpl;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantAddress;
import org.runningdinner.participant.ParticipantName;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamService;
import org.runningdinner.wizard.BasicDetailsTO;
import org.runningdinner.wizard.CreateRunningDinnerWizardService;

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

  public static RegistrationDataV2TO createRegistrationData(String fullname, String email, ParticipantAddress address, int numberOfSeats) {

    RegistrationDataV2TO registrationData = new RegistrationDataV2TO();
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
  
  /**
   * Creates a complete running dinner instance and also arranges also random teams out of the participants
   * 
   * @param createService
   * @param teamService
   * @return
   * @throws NoPossibleRunningDinnerException
   */
  public static RunningDinner createExampleDinnerAndVisitationPlans(CreateRunningDinnerWizardService createService, TeamService teamService)
    throws NoPossibleRunningDinnerException {

    LocalDate now = LocalDate.now();
    RunningDinnerInfo info = TestUtil.newBasicDetails("title", now, "Freiburg");
    RunningDinnerConfig runningDinnerConfig = RunningDinnerConfig.newConfigurer().build();

    List<Participant> participants = ParticipantGenerator.generateParticipants(18 + 1);

    Contract contract = CreateRunningDinnerInitializationService.createContract();
    RunningDinner dinner = createService.createRunningDinnerWithParticipants(info, runningDinnerConfig, "email@email.de", RunningDinnerType.STANDARD, contract, participants);
    teamService.createTeamAndVisitationPlans(dinner.getAdminId());

    assertThat(teamService.findTeamArrangements(dinner.getAdminId(), false)).hasSize(9);
    return dinner;
  }

  public static MailServerSettingsImpl generateTestableMailServerSettings() {

    MailServerSettingsImpl result = new MailServerSettingsImpl();
    result.setMailServer("smtp.gmx.de");
    result.setMailServerPort(587);
    result.setFrom("from@from.de");
    result.setPassword("password");
    result.setUsername("username");
    result.setUseTls(true);
    return result;
  }

  public static File getClasspathResourceAsFile(final String path)
    throws URISyntaxException {

    URL tmpUrl = TestUtil.class.getResource(path);
    File file = new File(tmpUrl.toURI());
    return file;
  }

  public static void deleteChildFiles(File directory) {

    File[] children = directory.listFiles();
    if (children != null && children.length > 0) {
      for (File child : children) {
        child.delete();
      }
    }
  }

  public static int getNumChildren(File directory) {

    File[] tmp = directory.listFiles();
    if (tmp == null || tmp.length == 0) {
      return 0;
    }
    return tmp.length;
  }

  public static List<Participant> setMatchingTeamPartnerWish(List<Participant> teamMembers, 
                                                             int idx1, 
                                                             int idx2, 
                                                             String email1, 
                                                             String email2, 
                                                             boolean markParticipantActivated) {
    
    teamMembers.get(idx1).setEmail(email1);
    teamMembers.get(idx1).setTeamPartnerWish(email2);
    teamMembers.get(idx2).setEmail(email2);
    teamMembers.get(idx2).setTeamPartnerWish(email1);
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
}
