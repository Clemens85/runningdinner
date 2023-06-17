package org.runningdinner.admin;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDate;
import java.util.List;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.job.MessageJob;
import org.runningdinner.admin.message.job.MessageTask;
import org.runningdinner.admin.message.job.MessageType;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.util.DateTimeUtil;
import org.runningdinner.frontend.FrontendRunningDinnerService;
import org.runningdinner.frontend.ParticipantActivationResult;
import org.runningdinner.frontend.RegistrationSummary;
import org.runningdinner.frontend.rest.RegistrationDataTO;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantAddress;
import org.runningdinner.participant.ParticipantName;
import org.runningdinner.participant.ParticipantRepository;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.partnerwish.TeamPartnerWishInvitationState;
import org.runningdinner.participant.rest.ParticipantInputDataTO;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.runningdinner.test.util.TestUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ApplicationTest
public class TeamPartnerWishStateHandlingTest {
  
  private static final LocalDate DINNER_DATE = LocalDate.now().plusDays(7); 

  @Autowired
  private TestHelperService testHelperService;

  @Autowired
  private ParticipantService participantService;

  @Autowired
  private FrontendRunningDinnerService frontendRunningDinnerService;
  
  @Autowired
  private MessageService messageService;
  
  @Autowired
  private ParticipantRepository participantRepository;

  private RunningDinner runningDinner;
  private String publicId;
  private String dinnerDateAsStr;

  
  @Before
  public void setUp() throws NoPossibleRunningDinnerException {

    runningDinner = testHelperService.createOpenRunningDinnerWithParticipants(DINNER_DATE, 16);
    publicId = runningDinner.getPublicSettings().getPublicId();
    dinnerDateAsStr = DateTimeUtil.getDefaultFormattedDate(DINNER_DATE, runningDinner.getLanguageCode());
  }
  
  @Test
  public void wishedTeamPartnerNotYetSubscribed() {
    
    String participantEmail = "foo@bar.de";
    String participantEmailEncoded = "foo%40bar.de";
    
    RegistrationDataTO registrationData = TestUtil.createRegistrationData("Foo Bar", participantEmail, newAddress(), 6);
    registrationData.setTeamPartnerWishEmail("wished@partner.de");
    
    RegistrationSummary registrationSummary = frontendRunningDinnerService.performRegistration(publicId, registrationData, false);
    assertThat(registrationSummary.getTeamPartnerWishState()).isEqualTo(TeamPartnerWishInvitationState.NOT_EXISTING);
    
    assertNoTeamPartnerWishMessageTask();
    
    frontendRunningDinnerService.activateSubscribedParticipant(publicId, registrationSummary.getParticipant().getId());
    
    MessageTask messageTask = assertTeamPartnerWishMessageTask();
    assertThat(messageTask.getMessage().getSubject()).contains("Foo Bar", dinnerDateAsStr);
    assertThat(messageTask.getMessage().getContent()).contains("Foo Bar", "Freiburg", runningDinner.getPublicSettings().getPublicTitle(), dinnerDateAsStr, 
                                                                participantEmail, publicId,
                                                                "invitingParticipantEmail=" + participantEmailEncoded, "prefilledEmailAddress=wished%40partner.de");
    assertThat(messageTask.getRecipientEmail()).isEqualTo("wished@partner.de");
  }
  
  @Test
  public void wishedTeamPartnerAlreadySubscribedWithSamePartnerWish() {
    
    updateFirstAlreadySubscribedParticipant("Already Subscribed", "already@subscribed.de", "foo@bar.de");
    
    String newParticipantEmail = "foo@bar.de";
    
    RegistrationDataTO registrationData = TestUtil.createRegistrationData("Foo Bar", newParticipantEmail, newAddress(), 6);
    registrationData.setTeamPartnerWishEmail("already@subscribed.de");
    RegistrationSummary registrationSummary = frontendRunningDinnerService.performRegistration(publicId, registrationData, false);

    assertThat(registrationSummary.getTeamPartnerWishState()).isEqualTo(TeamPartnerWishInvitationState.EXISTS_SAME_TEAM_PARTNER_WISH);
    
    assertNoTeamPartnerWishMessageTask();

    frontendRunningDinnerService.activateSubscribedParticipant(publicId, registrationSummary.getParticipant().getId());

    MessageTask messageTask = assertTeamPartnerWishMessageTask();
    assertThat(messageTask.getMessage().getSubject()).contains("Foo Bar", "angemeldet");
    assertThat(messageTask.getMessage().getContent()).contains("Freiburg", dinnerDateAsStr, runningDinner.getPublicSettings().getPublicTitle(), "Already Subscribed");
    assertThat(messageTask.getRecipientEmail()).isEqualTo("already@subscribed.de");
  }
  
  @Test
  public void wishedTeamPartnerAlreadySubscribedWithNoPartnerWish() {
    
    // Simulate already subscribed participant with no team-wish:
    Participant alreadySubscribedPartner = updateFirstAlreadySubscribedParticipant("Already Subscribed", "already@subscribed.de", null);

    String newParticipantEmail = "foo@bar.de";
    String newParticipantEmailEncoded = "foo%40bar.de";
    
    RegistrationDataTO registrationData = TestUtil.createRegistrationData("Foo Bar", newParticipantEmail, newAddress(), 6);
    registrationData.setTeamPartnerWishEmail("already@subscribed.de");
    RegistrationSummary registrationSummary = frontendRunningDinnerService.performRegistration(publicId, registrationData, false);

    assertThat(registrationSummary.getTeamPartnerWishState()).isNull();
    
    assertNoTeamPartnerWishMessageTask();
    
    frontendRunningDinnerService.activateSubscribedParticipant(publicId, registrationSummary.getParticipant().getId());

    String confirmationUrlPart = "/teampartnerwish/" + alreadySubscribedPartner.getId().toString() + "?email=" + newParticipantEmailEncoded;
    
    MessageTask messageTask = assertTeamPartnerWishMessageTask();
    assertThat(messageTask.getMessage().getSubject()).contains("Foo Bar", dinnerDateAsStr);
    assertThat(messageTask.getMessage().getContent()).contains("Foo Bar", "Already Subscribed", 
                                                                "Freiburg", runningDinner.getPublicSettings().getPublicTitle(), dinnerDateAsStr, 
                                                                newParticipantEmail, newParticipantEmailEncoded, 
                                                                runningDinner.getSelfAdministrationId().toString(), confirmationUrlPart);
    assertThat(messageTask.getRecipientEmail()).isEqualTo("already@subscribed.de");
  }
  
  @Test
  public void conflictingTeamPartnerWish() {
    
    // Simulate already subscribed participant with no team-wish:
    Participant alreadySubscribedPartner = updateFirstAlreadySubscribedParticipant("Already Subscribed", "already@subscribed.de", "other@wish.de");
    
    String newParticipantEmail = "foo@bar.de";
    String newParticipantEmailEncoded = "foo%40bar.de";
    
    RegistrationDataTO registrationData = TestUtil.createRegistrationData("Foo Bar", newParticipantEmail, newAddress(), 6);
    registrationData.setTeamPartnerWishEmail("already@subscribed.de");
    RegistrationSummary registrationSummary = frontendRunningDinnerService.performRegistration(publicId, registrationData, false);

    assertThat(registrationSummary.getTeamPartnerWishState()).isNull();
    
    assertNoTeamPartnerWishMessageTask();
    
    frontendRunningDinnerService.activateSubscribedParticipant(publicId, registrationSummary.getParticipant().getId());
    
    String confirmationUrlPart = "/teampartnerwish/" + alreadySubscribedPartner.getId().toString() + "?email=" + newParticipantEmailEncoded;
    
    
    MessageTask messageTask = assertTeamPartnerWishMessageTask();
    assertThat(messageTask.getMessage().getSubject()).contains("Konflikt", "Foo Bar", dinnerDateAsStr);
    assertThat(messageTask.getMessage().getContent()).contains("Foo Bar", "Already Subscribed", 
                                                                "Freiburg", runningDinner.getPublicSettings().getPublicTitle(), dinnerDateAsStr, 
                                                                newParticipantEmail, newParticipantEmailEncoded, "other@wish.de",
                                                                runningDinner.getSelfAdministrationId().toString(), confirmationUrlPart);
    assertThat(messageTask.getRecipientEmail()).isEqualTo("already@subscribed.de");
  }
  
  @Test
  public void noPartnerWishButOthersHaveThisPartnerWish() {
   
    // Simulate already subscribed participant with no team-wish:
    updateFirstAlreadySubscribedParticipant("Already Subscribed", "already@subscribed.de", "foo@bar.de");
    
    String newParticipantEmail = "foo@bar.de";
    
    RegistrationDataTO registrationData = TestUtil.createRegistrationData("Foo Bar", newParticipantEmail, newAddress(), 6);
    RegistrationSummary registrationSummary = frontendRunningDinnerService.performRegistration(publicId, registrationData, false);

    assertThat(registrationSummary.getTeamPartnerWishState()).isNull();
    
    assertNoTeamPartnerWishMessageTask();
    
    ParticipantActivationResult activationResult = frontendRunningDinnerService.activateSubscribedParticipant(publicId, registrationSummary.getParticipant().getId());
    String confirmationUrlPart = "/teampartnerwish/" + activationResult.getActivatedParticipant().getId().toString() + "?email=already%40subscribed.de";

    MessageTask messageTask = assertTeamPartnerWishMessageTask();
    assertThat(messageTask.getMessage().getSubject()).contains("Already Subscribed", dinnerDateAsStr);
    assertThat(messageTask.getMessage().getContent()).contains("Freiburg", runningDinner.getPublicSettings().getPublicTitle(), dinnerDateAsStr,
                                                                confirmationUrlPart, "already@subscribed.de");
    assertThat(messageTask.getRecipientEmail()).isEqualTo("foo@bar.de");
  }
  
  @Test
  public void noActionForNewSubscriptionWithoutPartnerWish() {
    
    // Simulate already subscribed participant with no team-wish:
    updateFirstAlreadySubscribedParticipant("Already Subscribed", "already@subscribed.de", "other@wish.de");
    
    RegistrationDataTO registrationData = TestUtil.createRegistrationData("Foo Bar", "foo@bar.de", newAddress(), 6);
    RegistrationSummary registrationSummary = frontendRunningDinnerService.performRegistration(publicId, registrationData, false);

    assertNoTeamPartnerWishMessageTask();
    
    frontendRunningDinnerService.activateSubscribedParticipant(publicId, registrationSummary.getParticipant().getId());
    
    assertNoTeamPartnerWishMessageTask();
  }
  
  @Test
  public void secondPartnerActivatesSubscriptionBeforeFirstPartner() {
    
    Participant firstParticipant = updateFirstAlreadySubscribedParticipant("Already Subscribed", "already@subscribed.de", "foo@bar.de");
    firstParticipant.setActivationDate(null);
    participantRepository.save(firstParticipant);
    
    String newParticipantEmail = "foo@bar.de";
    
    RegistrationDataTO registrationData = TestUtil.createRegistrationData("Foo Bar", newParticipantEmail, newAddress(), 6);
    registrationData.setTeamPartnerWishEmail("already@subscribed.de");
    RegistrationSummary registrationSummary = frontendRunningDinnerService.performRegistration(publicId, registrationData, false);

    assertNoTeamPartnerWishMessageTask();

    // Ensure that first participant (who is not yet subscribed) gets also a note about subscription activation
    
    frontendRunningDinnerService.activateSubscribedParticipant(publicId, registrationSummary.getParticipant().getId());

    String activateSubscriptionUrl = "/" + firstParticipant.getId() + "/activate";
    
    MessageTask messageTask = assertTeamPartnerWishMessageTask();
    assertThat(messageTask.getMessage().getSubject()).contains("Foo Bar", "angemeldet");
    assertThat(messageTask.getMessage().getContent()).contains("Freiburg", dinnerDateAsStr, runningDinner.getPublicSettings().getPublicTitle(), 
                                                                "Already Subscribed", activateSubscriptionUrl);
    assertThat(messageTask.getRecipientEmail()).isEqualTo("already@subscribed.de");
    
  }
  
  private Participant updateFirstAlreadySubscribedParticipant(String newName, String newEmail, String optionalTeamPartnerWish) {
    
    List<Participant> participants = participantService.findParticipants(runningDinner.getAdminId(), true);
    // Simulate already subscribed participant with no team-wish:
    Participant result = participants.get(0);
    result.setEmail(newEmail);
    result.setName(ParticipantName.newName().withCompleteNameString(newName));
    result.setTeamPartnerWishEmail(optionalTeamPartnerWish);
    return participantService.updateParticipant(runningDinner.getAdminId(), result.getId(), new ParticipantInputDataTO(result));
  }
  
  private MessageTask assertTeamPartnerWishMessageTask() {
    
    List<MessageJob> messageJobs = messageService.findMessageJobs(runningDinner.getAdminId(), MessageType.TEAM_PARTNER_WISH);
    assertThat(messageJobs).hasSize(1);
    List<MessageTask> messageTasks = messageService.findMessageTasks(runningDinner.getAdminId(),  messageJobs.get(0).getId());
    assertThat(messageTasks).hasSize(1);
    return messageTasks.get(0);
  }
  
  private void assertNoTeamPartnerWishMessageTask() {
    
    List<MessageJob> messageJobs = messageService.findMessageJobs(runningDinner.getAdminId(), MessageType.TEAM_PARTNER_WISH);
    assertThat(messageJobs).isEmpty();
  }
  
  private static ParticipantAddress newAddress() {
    
    return ParticipantAddress.parseFromCommaSeparatedString("Musterstraße 1, 47111 Musterstadt");
  }
}
