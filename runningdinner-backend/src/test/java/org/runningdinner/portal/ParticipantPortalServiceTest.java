package org.runningdinner.portal;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.dinnerroute.DinnerRouteMessage;
import org.runningdinner.admin.message.job.MessageJob;
import org.runningdinner.admin.message.team.TeamMessage;
import org.runningdinner.admin.message.team.TeamSelection;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.frontend.FrontendRunningDinnerService;
import org.runningdinner.initialization.CreateRunningDinnerInitializationService;
import org.runningdinner.mail.mock.MailSenderMockInMemory;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.TeamService;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.runningdinner.test.util.TestUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(SpringExtension.class)
@ApplicationTest
class ParticipantPortalServiceTest {

  private static final String PARTICIPANT_EMAIL = "portal-test@example.com";
  private static final String ORGANIZER_EMAIL = CreateRunningDinnerInitializationService.DEFAULT_DINNER_CREATION_ADDRESS;
  private static final LocalDate DINNER_DATE = LocalDate.now().plusDays(30);

  @Autowired
  private ParticipantPortalService participantPortalService;

  @Autowired
  private FrontendRunningDinnerService frontendRunningDinnerService;

  @Autowired
  private TestHelperService testHelperService;

  @Autowired
  private PortalTokenRepository portalTokenRepository;

  @Autowired
  private MessageService messageService;

  @Autowired
  private TeamService teamService;

  @Autowired
  private ParticipantService participantService;

  private MailSenderMockInMemory mailSenderInMemory;

  private RunningDinner runningDinner;

  @BeforeEach
  void setUp() {
    runningDinner = testHelperService.createPublicRunningDinner(DINNER_DATE, 5, RegistrationType.OPEN, true);
    mailSenderInMemory = testHelperService.getMockedMailSender();
    mailSenderInMemory.setUp();
  }

  @Test
  void getOrCreatePortalToken_isIdempotent() {
    String token1 = participantPortalService.getOrCreatePortalToken(PARTICIPANT_EMAIL);
    String token2 = participantPortalService.getOrCreatePortalToken(PARTICIPANT_EMAIL);

    assertNotNull(token1);
    assertThat(token1).isEqualTo(token2);

    Optional<PortalToken> stored = portalTokenRepository.findByEmail(PARTICIPANT_EMAIL.toLowerCase());
    assertThat(stored).isPresent();
    assertThat(stored.get().getToken()).isEqualTo(token1);
  }

  @Test
  void resolveMyEvents_showsActivatedParticipant() {
    var registrationSummary = frontendRunningDinnerService.performRegistration(
        runningDinner.getPublicSettings().getPublicId(),
        TestUtil.createRegistrationData("Max Mustermann", PARTICIPANT_EMAIL, TestUtil.newAddress(), 6), false);
    frontendRunningDinnerService.activateSubscribedParticipant(
        runningDinner.getPublicSettings().getPublicId(), registrationSummary.getParticipant().getId());

    String portalToken = participantPortalService.getOrCreatePortalToken(PARTICIPANT_EMAIL);
    PortalMyEventsResponseTO myEvents = participantPortalService.resolveMyEvents(new PortalMyEventsRequestTO(List.of(portalToken)));
    String publicId = runningDinner.getPublicSettings().getPublicId();
    PortalEventEntryTO event = myEvents.getEvents().stream()
        .filter(e -> e.getPublicUrl() != null && e.getPublicUrl().contains(publicId))
        .findFirst()
        .orElseThrow(() -> new AssertionError("No event found for publicId " + publicId));
    assertThat(event.getRoles()).containsExactly(PortalRole.PARTICIPANT);
  }

  @Test
  void resolveMyEvents_hidesUnactivatedParticipant() {
    frontendRunningDinnerService.performRegistration(
        runningDinner.getPublicSettings().getPublicId(),
        TestUtil.createRegistrationData("Unactivated User", PARTICIPANT_EMAIL, TestUtil.newAddress(), 6), false);

    String portalToken = participantPortalService.getOrCreatePortalToken(PARTICIPANT_EMAIL);
    PortalMyEventsResponseTO myEvents = participantPortalService.resolveMyEvents(new PortalMyEventsRequestTO(List.of(portalToken)));

    // PARTICIPANT_EMAIL has no other dinners — assert none of the returned entries are for this dinner
    String publicId = runningDinner.getPublicSettings().getPublicId();
    assertThat(myEvents.getEvents()).noneMatch(e -> e.getPublicUrl() != null && e.getPublicUrl().contains(publicId));
  }

  @Test
  void resolveMyEvents_mergesRoles_whenSameEmailIsBothParticipantAndOrganizer() {
    // Register & activate using the organizer's email so one token resolves both roles for the same dinner
    var registrationSummary = frontendRunningDinnerService.performRegistration(
        runningDinner.getPublicSettings().getPublicId(),
        TestUtil.createRegistrationData("Organizer also Participant", ORGANIZER_EMAIL, TestUtil.newAddress(), 6), false);
    frontendRunningDinnerService.activateSubscribedParticipant(
        runningDinner.getPublicSettings().getPublicId(), registrationSummary.getParticipant().getId());

    String organizerToken = participantPortalService.getOrCreatePortalToken(ORGANIZER_EMAIL);
    PortalMyEventsResponseTO myEvents = participantPortalService.resolveMyEvents(new PortalMyEventsRequestTO(List.of(organizerToken)));

    // Filter to the specific dinner under test using its adminId embedded in adminUrl
    String adminId = runningDinner.getAdminId();
    PortalEventEntryTO event = myEvents.getEvents().stream()
        .filter(e -> e.getAdminUrl() != null && e.getAdminUrl().contains(adminId))
        .findFirst()
        .orElseThrow(() -> new AssertionError("No event found for adminId " + adminId));

    assertThat(event.getRoles()).containsExactlyInAnyOrder(PortalRole.ORGANIZER, PortalRole.PARTICIPANT);
    assertThat(event.getAdminUrl()).isNotBlank();
  }

  @Test
  void resolveMyEvents_deduplicatesSameDinner_acrossMultipleTokens() {
    // Participant token sees the dinner as PARTICIPANT
    var registrationSummary = frontendRunningDinnerService.performRegistration(
        runningDinner.getPublicSettings().getPublicId(),
        TestUtil.createRegistrationData("Test Participant", PARTICIPANT_EMAIL, TestUtil.newAddress(), 6), false);
    frontendRunningDinnerService.activateSubscribedParticipant(
        runningDinner.getPublicSettings().getPublicId(), registrationSummary.getParticipant().getId());

    String participantToken = participantPortalService.getOrCreatePortalToken(PARTICIPANT_EMAIL);
    // Organizer token sees the same dinner as ORGANIZER
    String organizerToken = participantPortalService.getOrCreatePortalToken(ORGANIZER_EMAIL);

    PortalMyEventsResponseTO myEvents = participantPortalService.resolveMyEvents(
        new PortalMyEventsRequestTO(List.of(participantToken, organizerToken)));

    // The same dinner must appear exactly once in the merged result — filter by adminId
    String adminId = runningDinner.getAdminId();
    List<PortalEventEntryTO> entriesForThisDinner = myEvents.getEvents().stream()
        .filter(e -> (e.getAdminUrl() != null && e.getAdminUrl().contains(adminId)) ||
                     (e.getPublicUrl() != null && e.getPublicUrl().contains(runningDinner.getPublicSettings().getPublicId())))
        .toList();
    assertThat(entriesForThisDinner).hasSize(1);
    assertThat(entriesForThisDinner.getFirst().getRoles())
        .containsExactlyInAnyOrder(PortalRole.PARTICIPANT, PortalRole.ORGANIZER);
  }

  @Test
  void resolveMyEvents_unknownToken_returnsEmpty() {
    PortalMyEventsResponseTO result = participantPortalService.resolveMyEvents(new PortalMyEventsRequestTO(List.of("unknown-token-xyz")));
    assertThat(result.getEvents()).isEmpty();
  }

  // ─── revokePortalTokens ───────────────────────────────────────────────────

  @Test
  void revokePortalTokens_deletesExistingToken() {
    String token = participantPortalService.getOrCreatePortalToken(PARTICIPANT_EMAIL);
    assertThat(portalTokenRepository.findByToken(token)).isPresent();

    participantPortalService.revokePortalTokens(List.of(token));

    assertThat(portalTokenRepository.findByToken(token)).isEmpty();
  }

  @Test
  void revokePortalTokens_ignoresUnknownToken() {
    // Must not throw
    participantPortalService.revokePortalTokens(List.of("no-such-token-xyz"));
  }

  // ─── requestAccessRecovery ────────────────────────────────────────────────

  @Test
  void requestAccessRecovery_doesNotSendEmail_forUnknownAddress() {
    participantPortalService.requestAccessRecovery("nobody@nowhere.invalid");

    assertThat(portalTokenRepository.findByEmail("nobody@nowhere.invalid")).isEmpty();
    assertThat(mailSenderInMemory.getMessages()).isEmpty();
  }

  @Test
  void requestAccessRecovery_sendsEmail_forKnownParticipantEmail() {
    var registrationSummary = frontendRunningDinnerService.performRegistration(
        runningDinner.getPublicSettings().getPublicId(),
        TestUtil.createRegistrationData("Recovery User", PARTICIPANT_EMAIL, TestUtil.newAddress(), 6), false);
    frontendRunningDinnerService.activateSubscribedParticipant(
        runningDinner.getPublicSettings().getPublicId(), registrationSummary.getParticipant().getId());

    participantPortalService.requestAccessRecovery(PARTICIPANT_EMAIL);

    Optional<PortalToken> token = portalTokenRepository.findByEmail(PARTICIPANT_EMAIL.toLowerCase());
    assertThat(token).isPresent();
    assertThat(token.get().getLastRecoveryEmailSentAt()).isNotNull();
    assertThat(mailSenderInMemory.getMessages())
        .anyMatch(m -> PARTICIPANT_EMAIL.equalsIgnoreCase(m.getTo()[0]));
  }

  @Test
  void requestAccessRecovery_respectsCooldown_onSubsequentRequest() {
    var registrationSummary = frontendRunningDinnerService.performRegistration(
        runningDinner.getPublicSettings().getPublicId(),
        TestUtil.createRegistrationData("Cooldown User", PARTICIPANT_EMAIL, TestUtil.newAddress(), 6), false);
    frontendRunningDinnerService.activateSubscribedParticipant(
        runningDinner.getPublicSettings().getPublicId(), registrationSummary.getParticipant().getId());

    // First call — email is sent
    participantPortalService.requestAccessRecovery(PARTICIPANT_EMAIL);
    LocalDateTime firstSentAt = portalTokenRepository.findByEmail(PARTICIPANT_EMAIL.toLowerCase())
        .orElseThrow().getLastRecoveryEmailSentAt();
    assertThat(firstSentAt).isNotNull();

    // Second call within cooldown — should be a no-op
    mailSenderInMemory.removeAllMessages();
    participantPortalService.requestAccessRecovery(PARTICIPANT_EMAIL);

    LocalDateTime secondSentAt = portalTokenRepository.findByEmail(PARTICIPANT_EMAIL.toLowerCase())
        .orElseThrow().getLastRecoveryEmailSentAt();
    assertThat(secondSentAt).isEqualTo(firstSentAt); // timestamp unchanged
    assertThat(mailSenderInMemory.getMessages()).isEmpty();
  }

  // ─── resolveParticipantSelfServiceInfo ────────────────────────────────────

  @Test
  void resolveParticipantSelfServiceInfo_throwsForUnknownToken() {
    var registrationSummary = frontendRunningDinnerService.performRegistration(
        runningDinner.getPublicSettings().getPublicId(),
        TestUtil.createRegistrationData("Test User", PARTICIPANT_EMAIL, TestUtil.newAddress(), 6), false);
    frontendRunningDinnerService.activateSubscribedParticipant(
        runningDinner.getPublicSettings().getPublicId(), registrationSummary.getParticipant().getId());

    assertThrows(IllegalArgumentException.class, () ->
        participantPortalService.resolveParticipantSelfServiceInfo(
            runningDinner.getSelfAdministrationId(),
            registrationSummary.getParticipant().getId(),
            "unknown-token-xyz"));
  }

  @Test
  void resolveParticipantSelfServiceInfo_returnsNull_whenNotAssignedToTeam() {
    var registrationSummary = frontendRunningDinnerService.performRegistration(
        runningDinner.getPublicSettings().getPublicId(),
        TestUtil.createRegistrationData("Test User", PARTICIPANT_EMAIL, TestUtil.newAddress(), 6), false);
    frontendRunningDinnerService.activateSubscribedParticipant(
        runningDinner.getPublicSettings().getPublicId(), registrationSummary.getParticipant().getId());
    String portalToken = participantPortalService.getOrCreatePortalToken(PARTICIPANT_EMAIL);

    ParticipantSelfServiceInfoTO result = participantPortalService.resolveParticipantSelfServiceInfo(
        runningDinner.getSelfAdministrationId(),
        registrationSummary.getParticipant().getId(),
        portalToken);

    assertThat(result).isNull();
  }

  @Test
  void resolveParticipantSelfServiceInfo_hasNoTeamInfo_whenNoMailsSent() {
    RunningDinner closedDinner = testHelperService.createClosedRunningDinnerWithParticipants(DINNER_DATE, 18);
    teamService.createTeamAndVisitationPlans(closedDinner.getAdminId());

    List<Participant> participants = participantService.findParticipants(closedDinner.getAdminId(), true);
    Participant first = participants.getFirst();
    String portalToken = participantPortalService.getOrCreatePortalToken(first.getEmail());

    ParticipantSelfServiceInfoTO result = participantPortalService.resolveParticipantSelfServiceInfo(
        closedDinner.getSelfAdministrationId(), first.getId(), portalToken);

    assertThat(result).isNotNull();
    assertThat(result.getTeamSelfServiceInfo()).isNull();
    assertThat(result.getDinnerRouteUrl()).isNull();
  }

  @Test
  void resolveParticipantSelfServiceInfo_populatesTeamInfo_afterTeamMailsSent() {
    RunningDinner closedDinner = testHelperService.createClosedRunningDinnerWithParticipants(DINNER_DATE, 18);
    teamService.createTeamAndVisitationPlans(closedDinner.getAdminId());
    sendTeamMessages(closedDinner);

    List<Participant> participants = participantService.findParticipants(closedDinner.getAdminId(), true);
    Participant first = participants.getFirst();
    String portalToken = participantPortalService.getOrCreatePortalToken(first.getEmail());

    ParticipantSelfServiceInfoTO result = participantPortalService.resolveParticipantSelfServiceInfo(
        closedDinner.getSelfAdministrationId(), first.getId(), portalToken);

    assertThat(result).isNotNull();
    TeamSelfServiceInfo teamInfo = result.getTeamSelfServiceInfo();
    assertThat(teamInfo).isNotNull();
    assertThat(teamInfo.getMealLabel()).isNotBlank();
    assertThat(teamInfo.getHostName()).isNotBlank();
    assertThat(teamInfo.getTeamPartnerName()).isNotBlank();
    assertThat(teamInfo.getManageTeamHostingUrl()).isNotBlank();
    assertThat(result.getDinnerRouteUrl()).isNull(); // not yet sent
  }

  @Test
  void resolveParticipantSelfServiceInfo_populatesDinnerRouteUrl_afterRouteMailsSent() {
    RunningDinner closedDinner = testHelperService.createClosedRunningDinnerWithParticipants(DINNER_DATE, 18);
    teamService.createTeamAndVisitationPlans(closedDinner.getAdminId());
    sendTeamMessages(closedDinner);
    sendDinnerRouteMessages(closedDinner);

    List<Participant> participants = participantService.findParticipants(closedDinner.getAdminId(), true);
    Participant first = participants.getFirst();
    String portalToken = participantPortalService.getOrCreatePortalToken(first.getEmail());

    ParticipantSelfServiceInfoTO result = participantPortalService.resolveParticipantSelfServiceInfo(
        closedDinner.getSelfAdministrationId(), first.getId(), portalToken);

    assertThat(result).isNotNull();
    assertThat(result.getDinnerRouteUrl()).isNotBlank();
  }

  // ─── private helpers ─────────────────────────────────────────────────────

  private void sendTeamMessages(RunningDinner dinner) {
    TeamMessage msg = new TeamMessage();
    msg.setMessage("Message");
    msg.setSubject("Subject");
    msg.setHostMessagePartTemplate("Host part");
    msg.setNonHostMessagePartTemplate("NonHost part");
    msg.setTeamSelection(TeamSelection.ALL);
    MessageJob messageJob = messageService.sendTeamMessages(dinner.getAdminId(), msg);
    testHelperService.awaitMessageJobFinished(messageJob);
  }

  private void sendDinnerRouteMessages(RunningDinner dinner) {
    DinnerRouteMessage msg = new DinnerRouteMessage();
    msg.setMessage("{route}");
    msg.setSubject("Dinner Route");
    msg.setHostsTemplate("Hosts");
    msg.setSelfTemplate("Self");
    msg.setTeamSelection(TeamSelection.ALL);
    MessageJob messageJob = messageService.sendDinnerRouteMessages(dinner.getAdminId(), msg);
    testHelperService.awaitMessageJobFinished(messageJob);
  }
}
