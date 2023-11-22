package org.runningdinner.frontend;

import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.job.MessageJob;
import org.runningdinner.admin.message.participant.ParticipantMessage;
import org.runningdinner.admin.message.participant.ParticipantSelection;
import org.runningdinner.common.IssueKeys;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.core.Gender;
import org.runningdinner.core.MealSpecifics;
import org.runningdinner.core.ParticipantGenerator;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.frontend.rest.RegistrationDataTO;
import org.runningdinner.initialization.CreateRunningDinnerInitializationService;
import org.runningdinner.mail.MailSenderFactory;
import org.runningdinner.mail.mock.MailSenderMockInMemory;
import org.runningdinner.participant.*;
import org.runningdinner.participant.rest.ParticipantTO;
import org.runningdinner.participant.rest.TeamArrangementListTO;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.runningdinner.test.util.TestUtil;
import org.runningdinner.wizard.CreateRunningDinnerWizardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;


@RunWith(SpringJUnit4ClassRunner.class)
@ApplicationTest
public class TeamPartnerRegistrationTest {

  @Autowired
  private FrontendRunningDinnerService frontendRunningDinnerService;
  
  @Autowired
  private TestHelperService testHelperService;
  
  @Autowired
  private ParticipantService participantService;
  
  @Autowired
  private ParticipantRepository participantRepository;
  
  @Autowired
  private MessageService messageService;

  @Autowired
  private MailSenderFactory mailSenderFactory;
  
  @Autowired
  private CreateRunningDinnerWizardService createRunningDinnerWizardService;
  
  @Autowired
  private TeamService teamService;

  @Autowired
  private WaitingListService waitingListService;
  
  private MailSenderMockInMemory mailSenderInMemory;
  
  private RunningDinner runningDinner;

  private String publicDinnerId;
  
  @Before
  public void setUp() {

    this.mailSenderInMemory = (MailSenderMockInMemory) mailSenderFactory.getMailSender(); // Test uses always this implementation
    this.mailSenderInMemory.setUp();
    this.mailSenderInMemory.addIgnoreRecipientEmail(CreateRunningDinnerInitializationService.DEFAULT_DINNER_CREATION_ADDRESS);
    
    runningDinner = testHelperService.createPublicRunningDinner(LocalDate.now().plusDays(30), 2);
    publicDinnerId = runningDinner.getPublicSettings().getPublicId();
  }
  
  @Test
  public void registerTeamPartnerAndActivateBoth() {

    RegistrationDataTO registrationData = TestUtil.createRegistrationData("Max Mustermann", "max@muster.de", TestUtil.newAddress(), 6);
    registrationData.setTeamPartnerWishRegistrationData(TestUtil.newTeamPartnerwithRegistrationData("Maria", "Musterfrau"));
    
    RegistrationSummary registrationSummary = frontendRunningDinnerService.performRegistration(publicDinnerId, registrationData, false);
    assertThat(registrationSummary.getTeamPartnerWishRegistrationData()).isEqualTo(TestUtil.newTeamPartnerwithRegistrationData("Maria", "Musterfrau"));
    assertThat(registrationSummary.getTeamPartnerWishState()).isNull();
    
    // Verify second participant is also registered and both can be activated by root participant
    List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), true);
    assertThat(participants).isEmpty();
    
    participants = participantService.findParticipants(runningDinner.getAdminId(), false);
    assertThat(participants).hasSize(2);
    Participant rootParticipant = participants.get(0); // Root participant comes always before child participant
    assertThat(rootParticipant.getEmail()).isEqualTo("max@muster.de");
    assertThat(rootParticipant.getParticipantNumber()).isEqualTo(1);
    
    participantService.updateParticipantSubscription(rootParticipant.getId(), LocalDateTime.now(), true, runningDinner);
    
    participants = participantService.findParticipants(runningDinner.getAdminId(), true);
    assertThat(participants).hasSize(2);
    
    // Check data is correctly setup:
    rootParticipant = participants.get(0); 
    Participant childParticipant = participants.get(1);
    assertThat(childParticipant.getName()).isEqualTo(ParticipantName.newName().withCompleteNameString("Maria Musterfrau"));

    assertThat(childParticipant.getNumSeats()).isZero();
    assertThat(childParticipant.getAdminId()).isNotEmpty();
    assertThat(childParticipant.getAge()).isEqualTo(-1);
    assertThat(childParticipant.getGender()).isEqualTo(Gender.UNDEFINED);
    assertThat(childParticipant).isEqualToComparingOnlyGivenFields(rootParticipant, "adminId", "email", "address", "runningDinnerId", "mobileNumber");
    assertThat(childParticipant.getActivatedBy()).isEqualTo("max@muster.de");
    assertThat(childParticipant.getActivationDate()).isNotNull();
    assertThat(childParticipant.getMealSpecifics()).isEqualTo(MealSpecifics.NONE);
    assertThat(childParticipant.getNotes()).isNullOrEmpty();
    assertThat(childParticipant.getParticipantNumber()).isEqualTo(2);
    assertThat(childParticipant.getTeamPartnerWishEmail()).isNullOrEmpty();
    
    // Check correlations are properly setup
    assertThat(rootParticipant.isTeamPartnerWishRegistratonRoot()).isTrue();
    assertThat(childParticipant.isTeamPartnerWishRegistratonRoot()).isFalse();
    assertThat(childParticipant.isTeamPartnerWishRegistrationChildOf(rootParticipant));
  }

  @Test
  public void messagesAreSentOnlyOnce() throws InterruptedException {
    
    registerParticipantsAsFixedTeam();

    // Ensure activation msg is sent and clear sent messages
    Thread.sleep(1000);
    mailSenderInMemory.removeAllMessages();
    
    ParticipantMessage msg = new ParticipantMessage();
    msg.setSubject("subject");
    msg.setMessage("msg");
    msg.setParticipantSelection(ParticipantSelection.ALL);
    
    MessageJob messageJob = messageService.sendParticipantMessages(runningDinner.getAdminId(), msg);
    assertThat(messageJob).isNotNull();
    testHelperService.awaitMessageJobFinished(messageJob);

    Set<SimpleMailMessage> messages = mailSenderInMemory.getMessages();
    assertThat(messages).hasSize(1);
    SimpleMailMessage sentMsg = mailSenderInMemory.filterForMessageTo("max@muster.de");
    assertThat(sentMsg).isNotNull();
  }
  
  @Test
  public void validationForNotEnoughNumSeats() {
    
    RegistrationDataTO registrationData = TestUtil.createRegistrationData("Max Mustermann", "max@muster.de", TestUtil.newAddress(), 4);
    registrationData.setTeamPartnerWishRegistrationData(TestUtil.newTeamPartnerwithRegistrationData("Maria", "Musterfrau"));
    
    try {
      frontendRunningDinnerService.performRegistration(publicDinnerId, registrationData, false);
      Assert.fail("Expected ValidationException to be thrown for not enough numSeats");
    } catch (ValidationException e) {
      assertThat(e.getIssues().getIssues().get(0).getField()).isEqualTo("numSeats");
    }
  }
  
  @Test
  public void teamGenerationConsidersTeamPartnerRegistration() {

    registerParticipantsAsFixedTeam();
    
    List<Participant> otherParticipants = ParticipantGenerator.generateParticipants(16, 2);
    createRunningDinnerWizardService.saveAndActivateParticipantsToDinner(runningDinner, otherParticipants);
    
    teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());
    
    //List<Team> teams = teamService.findTeamArrangements(runningDinner.getAdminId(), false); 
    
    List<Participant> fixedTeamParticipants = participantService.findParticipantByEmail(runningDinner.getAdminId(), "max@muster.de");
    assertThat(fixedTeamParticipants).hasSize(2);
    assertThat(fixedTeamParticipants.get(0).getTeamId()).isEqualTo(fixedTeamParticipants.get(1).getTeamId());
    
    // Verify change team host does not work
    Team fixedTeam = teamService.findTeamById(runningDinner.getAdminId(), fixedTeamParticipants.get(0).getTeamId());
    try {
      teamService.updateTeamHosters(runningDinner, Collections.singletonMap(fixedTeam.getId(), fixedTeamParticipants.get(1).getId()));
      Assert.fail("updateTeamHosters should fail");
    } catch (IllegalStateException e) {
      // NOP
    }
    
    // Verify team swap does not work
    List<Team> teams = teamService.findTeamArrangements(runningDinner.getAdminId(), true);
    Team otherTeam = teams
                      .stream()
                      .filter(t -> !Objects.equals(fixedTeam, t))
                      .findFirst().orElseThrow(RuntimeException::new);
    
    try {
      teamService.swapTeamMembers(runningDinner.getAdminId(), fixedTeamParticipants.get(1).getId(), otherTeam.getHostTeamMember().getId());
      Assert.fail("Expected ValidationException to be thrown upon swap action");
    } catch (ValidationException e) {
      assertThat(e.getIssues().getIssues().get(0).getMessage()).isEqualTo(IssueKeys.TEAM_SWAP_VIOLATES_TEAM_PARTNER_WISH);
    }
    
  }
  
  @Test
  public void deleteRootParticipantWithoutExistingTeams() {

    Participant rootParticipant = registerParticipantsAsFixedTeam();
    
    assertThat(participantService.findParticipants(runningDinner.getAdminId(), false)).hasSize(2);
    
    participantService.deleteParticipant(runningDinner.getAdminId(), rootParticipant.getId());
   
    assertThat(participantService.findParticipants(runningDinner.getAdminId(), false)).hasSize(0);
  }
  
  @Test
  public void deleteChildParticipantWithoutExistingTeams() {
    
    registerParticipantsAsFixedTeam();
    assertThat(participantService.findParticipants(runningDinner.getAdminId(), false)).hasSize(2);
    
    List<Participant> registeredParticipants = participantService.findParticipantByEmail(runningDinner.getAdminId(), "max@muster.de");
    Participant childParticipant = registeredParticipants.get(1);
    assertThat(childParticipant.getParticipantNumber()).isEqualTo(2);
    
    participantService.deleteParticipant(runningDinner.getAdminId(), childParticipant.getId());
   
    assertThat(participantService.findParticipants(runningDinner.getAdminId(), false)).hasSize(1);
    
    registeredParticipants = participantService.findParticipantByEmail(runningDinner.getAdminId(), "max@muster.de");
    Participant rootParticipant = registeredParticipants.get(0);
    assertThat(rootParticipant.getTeamPartnerWishOriginatorId()).isNull();
  }
  
  @Test
  public void replaceExistingTeamByFixedTeam() {
    
    String adminId = runningDinner.getAdminId();
    
    List<Participant> existingParticipants = ParticipantGenerator.generateParticipants(18);
    createRunningDinnerWizardService.saveAndActivateParticipantsToDinner(runningDinner, existingParticipants);

    TeamArrangementListTO teamGenerationResult = teamService.createTeamAndVisitationPlans(adminId);
    UUID firstTeamId = teamGenerationResult.getTeams().get(0).getId();
    
    Participant rootParticipant = registerParticipantsAsFixedTeam();
    Participant childParticipant = participantRepository.findByTeamPartnerWishOriginatorIdAndIdNotAndAdminId(rootParticipant.getTeamPartnerWishOriginatorId(), rootParticipant.getId(), adminId);
    
    TeamCancellation teamCancellation = new TeamCancellation();
    teamCancellation.setDryRun(false);
    teamCancellation.setReplaceTeam(true);
    teamCancellation.setTeamId(firstTeamId);
    teamCancellation.setReplacementParticipantIds(Set.of(rootParticipant.getId(), childParticipant.getId()));
    
    teamService.cancelTeam(adminId, teamCancellation);
    
    Team firstTeam = teamService.findTeamByIdWithTeamMembers(adminId, firstTeamId);
    assertThat(firstTeam.getHostTeamMember()).isEqualTo(rootParticipant);
    assertThat(firstTeam.getTeamMembersOrdered()).containsExactly(rootParticipant, childParticipant);
  }
  
  @Test
  public void cancelTeamMemberChildOfFixedTeam() {
   
    UUID rootParticipantId = registerParticipantsAsFixedTeam().getId();
    
    List<Participant> otherParticipants = ParticipantGenerator.generateParticipants(16, 2);
    createRunningDinnerWizardService.saveAndActivateParticipantsToDinner(runningDinner, otherParticipants);
    
    teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());
    
    Participant rootParticipant = participantService.findParticipantById(runningDinner.getAdminId(), rootParticipantId);
    Team fixedTeam = teamService.findTeamByIdWithTeamMembers(runningDinner.getAdminId(), rootParticipant.getTeamId());
    
    Participant childParticipant = fixedTeam.getTeamMembersOrdered().get(1);
    assertThat(childParticipant.getName()).isEqualTo(ParticipantName.newName().withCompleteNameString("Maria Musterfrau"));
    teamService.cancelTeamMember(runningDinner.getAdminId(), fixedTeam.getId(), childParticipant.getId());

    rootParticipant = participantService.findParticipantById(runningDinner.getAdminId(), rootParticipantId);
    assertThat(rootParticipant.getTeamPartnerWishOriginatorId()).isNull();
    
    fixedTeam = teamService.findTeamByIdWithTeamMembers(runningDinner.getAdminId(), rootParticipant.getTeamId());
    assertThat(fixedTeam.getTeamMembersOrdered()).containsOnly(rootParticipant);
    assertThat(fixedTeam.getHostTeamMember()).isEqualTo(rootParticipant);
  }
  
  
  @Test
  public void cancelTeamMemberRootOfFixedTeamNotPossible() {
   
    UUID rootParticipantId = registerParticipantsAsFixedTeam().getId();
    
    List<Participant> otherParticipants = ParticipantGenerator.generateParticipants(16, 2);
    createRunningDinnerWizardService.saveAndActivateParticipantsToDinner(runningDinner, otherParticipants);
    
    teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());
    
    Participant rootParticipant = participantService.findParticipantById(runningDinner.getAdminId(), rootParticipantId);
    Team fixedTeam = teamService.findTeamByIdWithTeamMembers(runningDinner.getAdminId(), rootParticipant.getTeamId());
    
    try {
      teamService.cancelTeamMember(runningDinner.getAdminId(), fixedTeam.getId(), rootParticipantId);
      Assert.fail("Cancelling of root participant in team should not be possible!");
    } catch (ValidationException e) {
      
    }
  }
  
  @Test
  public void cancelTeamWithFixedTeamPartnersPossible() {
    
    UUID rootParticipantId = registerParticipantsAsFixedTeam().getId();
    
    List<Participant> otherParticipants = ParticipantGenerator.generateParticipants(16, 2);
    createRunningDinnerWizardService.saveAndActivateParticipantsToDinner(runningDinner, otherParticipants);
    
    teamService.createTeamAndVisitationPlans(runningDinner.getAdminId());
    
    Participant rootParticipant = participantService.findParticipantById(runningDinner.getAdminId(), rootParticipantId);
    Team fixedTeam = teamService.findTeamByIdWithTeamMembers(runningDinner.getAdminId(), rootParticipant.getTeamId());
   
    TeamCancellationResult cancellationResult = teamService.cancelTeam(runningDinner.getAdminId(), TestUtil.newCancellationWithoutReplacement(fixedTeam));
    assertThat(cancellationResult.getRemovedParticipants()).hasSize(2);
    
    fixedTeam = teamService.findTeamById(runningDinner.getAdminId(), fixedTeam.getId());
    assertThat(fixedTeam.getStatus()).isEqualTo(TeamStatus.CANCELLED);
  }
  
  @Test
  public void waitingListAssignment() {
    
    String adminId = runningDinner.getAdminId();
    
    List<Participant> existingParticipants = ParticipantGenerator.generateParticipants(18);
    createRunningDinnerWizardService.saveAndActivateParticipantsToDinner(runningDinner, existingParticipants);

    TeamArrangementListTO teamGenerationResult = teamService.createTeamAndVisitationPlans(adminId);
    UUID firstTeamId = teamGenerationResult.getTeams().get(0).getId();
    Team firstTeam = teamService.findTeamByIdWithTeamMembers(adminId, firstTeamId);
    
    Participant rootParticipant = registerParticipantsAsFixedTeam();
    Participant childParticipant = participantRepository.findByTeamPartnerWishOriginatorIdAndIdNotAndAdminId(rootParticipant.getTeamPartnerWishOriginatorId(), rootParticipant.getId(), adminId);
    
    firstTeam = teamService.cancelTeamMember(adminId, firstTeamId, firstTeam.getHostTeamMember().getId());
    assertThat(firstTeam.getTeamMembersOrdered()).hasSize(1);  
    
    try {
      waitingListService.assignParticipantsToExistingTeams(adminId, List.of(TestUtil.newTeamParticipantsAssignment(firstTeam, rootParticipant)));
      Assert.fail("Expected ValidationExcpetion to be thrown");
    } catch (ValidationException e) {
      assertThat(e.getIssues().getIssues().get(0).getMessage()).isEqualTo(IssueKeys.INVALID_REPLACEMENT_PARTICIPANTS_INCONSISTENT_TEAMPARTNER_WISH);
    }
    
    try {
      waitingListService.assignParticipantsToExistingTeams(adminId, List.of(TestUtil.newTeamParticipantsAssignment(firstTeam, childParticipant)));
      Assert.fail("Expected ValidationExcpetion to be thrown");
    } catch (ValidationException e) {
      assertThat(e.getIssues().getIssues().get(0).getMessage()).isEqualTo(IssueKeys.INVALID_REPLACEMENT_PARTICIPANTS_INCONSISTENT_TEAMPARTNER_WISH);
    }
    
    teamService.cancelTeam(adminId, TestUtil.newCancellationWithoutReplacement(firstTeam));
    firstTeam = teamService.findTeamByIdWithTeamMembers(adminId, firstTeamId);
    assertThat(firstTeam.getTeamMembersOrdered()).isEmpty();
      
    waitingListService.assignParticipantsToExistingTeams(adminId, List.of(TestUtil.newTeamParticipantsAssignment(firstTeam, rootParticipant, childParticipant)));

    firstTeam = teamService.findTeamByIdWithTeamMembers(adminId, firstTeamId);
    assertThat(firstTeam.getTeamMembersOrdered()).containsExactly(rootParticipant, childParticipant);
    assertThat(firstTeam.getHostTeamMember()).isEqualTo(rootParticipant);
  }
  
  @Test
  public void waitingListAddTeams() {
    
    String adminId = runningDinner.getAdminId();
    
    List<Participant> existingParticipants = ParticipantGenerator.generateParticipants(18);
    createRunningDinnerWizardService.saveAndActivateParticipantsToDinner(runningDinner, existingParticipants);

    teamService.createTeamAndVisitationPlans(adminId);
    
    Participant rootParticipant = registerParticipantsAsFixedTeam();
    Participant childParticipant = participantRepository.findByTeamPartnerWishOriginatorIdAndIdNotAndAdminId(rootParticipant.getTeamPartnerWishOriginatorId(), rootParticipant.getId(), adminId);
 
    // We have now 18 participants (arranged in teams) + 2 added participants (with teampartner registration) == 20 in total
    // Add 5 other participants, so that we get 25 particants in total
    List<Participant> otherParticipants = ParticipantGenerator.generateParticipants(5, 21);
    createRunningDinnerWizardService.saveAndActivateParticipantsToDinner(runningDinner, otherParticipants);

    List<ParticipantTO> otherParticipantsForTeamGeneration = otherParticipants
                                                              .stream()
                                                              .map(p -> new ParticipantTO(p))
                                                              .collect(Collectors.toList());
    
    List<ParticipantTO> generateNewTeamsParticipantList = new ArrayList<>(otherParticipantsForTeamGeneration);
    generateNewTeamsParticipantList.add(new ParticipantTO(rootParticipant));
    try {
      waitingListService.generateNewTeams(adminId, generateNewTeamsParticipantList);
      Assert.fail("Expected ValidationException");
    } catch (ValidationException e) {
      assertThat(e.getIssues().getIssues().get(0).getMessage()).isEqualTo(IssueKeys.INVALID_WAITINGLIST_TEAMGENERATION_INCONSISTENT_TEAMPARTNER_WISH);
    }
    
    
    generateNewTeamsParticipantList = new ArrayList<>(otherParticipantsForTeamGeneration);
    generateNewTeamsParticipantList.add(new ParticipantTO(childParticipant));
    try {
      waitingListService.generateNewTeams(adminId, generateNewTeamsParticipantList);
      Assert.fail("Expected ValidationException");
    } catch (ValidationException e) {
      assertThat(e.getIssues().getIssues().get(0).getMessage()).isEqualTo(IssueKeys.INVALID_WAITINGLIST_TEAMGENERATION_INCONSISTENT_TEAMPARTNER_WISH);
    }
    
    // Register other fixed team:
    Participant otherRootParticipant = registerOtherParticipantsAsFixedTeam();
    Participant otherChildParticipant = participantRepository.findByTeamPartnerWishOriginatorIdAndIdNotAndAdminId(otherRootParticipant.getTeamPartnerWishOriginatorId(), otherRootParticipant.getId(), adminId);
  
    // Try to generate out with one matching fixed teampartner registration (but with another one contianing only root participant) which should fail:
    generateNewTeamsParticipantList = otherParticipantsForTeamGeneration.subList(0, 3);
    generateNewTeamsParticipantList.addAll(List.of(new ParticipantTO(rootParticipant), new ParticipantTO(childParticipant), new ParticipantTO(otherRootParticipant)));
    try {
      waitingListService.generateNewTeams(adminId, generateNewTeamsParticipantList);
      Assert.fail("Expected ValidationException");
    } catch (ValidationException e) {
      assertThat(e.getIssues().getIssues().get(0).getMessage()).isEqualTo(IssueKeys.INVALID_WAITINGLIST_TEAMGENERATION_INCONSISTENT_TEAMPARTNER_WISH);
    }
  
    
    // Mix now both fixed team partner registrations and 2 normal participants, which should work:
    generateNewTeamsParticipantList = otherParticipantsForTeamGeneration.subList(0, 2);
    generateNewTeamsParticipantList.addAll(List.of(new ParticipantTO(rootParticipant), new ParticipantTO(childParticipant), 
                                                   new ParticipantTO(otherChildParticipant), new ParticipantTO(otherRootParticipant)));
    
    waitingListService.generateNewTeams(adminId, generateNewTeamsParticipantList);
    assertThat(teamService.findTeamArrangements(adminId, false)).hasSize(9 + 3);
   
    List<Participant> remainingParticipants = participantService.findActiveParticipantsNotAssignedToTeam(adminId);
    assertThat(remainingParticipants).hasSize(3);
    assertThat(remainingParticipants)
      .extracting("teamPartnerWishOriginatorId")
      .allMatch(teamPartnerWishOriginatorId -> teamPartnerWishOriginatorId == null);
  }
  
  
  private Participant registerParticipantsAsFixedTeam() {
    return testHelperService.registerParticipantsAsFixedTeam(runningDinner, "Max Mustermann", "max@muster.de", "Maria Musterfrau");
  }
  
  
  private Participant registerOtherParticipantsAsFixedTeam() {
    return testHelperService.registerParticipantsAsFixedTeam(runningDinner, "Foo Bar", "foo@bar.de", "Other Teampartner");
  }
  
}
