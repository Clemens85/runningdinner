package org.runningdinner.portal;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.frontend.FrontendRunningDinnerService;
import org.runningdinner.frontend.rest.RegistrationDataTO;
import org.runningdinner.initialization.CreateRunningDinnerInitializationService;
import org.runningdinner.participant.Participant;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.runningdinner.test.util.TestUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.LocalDate;
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

  private RunningDinner runningDinner;

  @BeforeEach
  void setUp() {
    runningDinner = testHelperService.createPublicRunningDinner(DINNER_DATE, 5, RegistrationType.OPEN, true);
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
  void validatePortalToken_succeeds_afterParticipantRegistration() {
    var registrationSummary = frontendRunningDinnerService.performRegistration(
        runningDinner.getPublicSettings().getPublicId(),
        TestUtil.createRegistrationData("Max Mustermann", PARTICIPANT_EMAIL, TestUtil.newAddress(), 6), false);
    frontendRunningDinnerService.activateSubscribedParticipant(
        runningDinner.getPublicSettings().getPublicId(), registrationSummary.getParticipant().getId());

    String portalToken = participantPortalService.getOrCreatePortalToken(PARTICIPANT_EMAIL);
    participantPortalService.validatePortalToken(portalToken);

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
  void performEventConfirmation_withConfirmationParams_activatesParticipant() {
    RegistrationDataTO registrationData = TestUtil.createRegistrationData("Anna Test", PARTICIPANT_EMAIL, TestUtil.newAddress(), 6);
    var registrationSummary = frontendRunningDinnerService.performRegistration(
        runningDinner.getPublicSettings().getPublicId(), registrationData, false);
    Participant participant = registrationSummary.getParticipant();

    String portalToken = participantPortalService.getOrCreatePortalToken(PARTICIPANT_EMAIL);
    String publicId = runningDinner.getPublicSettings().getPublicId();

    // First call: confirms the participant
    participantPortalService.performEventConfirmation(portalToken, publicId, participant.getId(), null);
    PortalMyEventsResponseTO myEvents1 = participantPortalService.resolveMyEvents(new PortalMyEventsRequestTO(List.of(portalToken)));
    assertThat(myEvents1.getEvents()).isNotEmpty();

    // Second call: idempotent — should not throw
    participantPortalService.performEventConfirmation(portalToken, publicId, participant.getId(), null);
    PortalMyEventsResponseTO myEvents2 = participantPortalService.resolveMyEvents(new PortalMyEventsRequestTO(List.of(portalToken)));
    assertThat(myEvents2.getEvents()).isNotEmpty();
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
  void validatePortalToken_unknownToken_throws404() {
    assertThrows(PortalTokenNotFoundException.class,
        () -> participantPortalService.validatePortalToken("unknown-token-xyz"));
  }

  @Test
  void resolveMyEvents_unknownToken_returnsEmpty() {
    PortalMyEventsResponseTO result = participantPortalService.resolveMyEvents(new PortalMyEventsRequestTO(List.of("unknown-token-xyz")));
    assertThat(result.getEvents()).isEmpty();
  }
}
