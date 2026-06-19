package org.runningdinner.portal;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.frontend.FrontendRunningDinnerService;
import org.runningdinner.frontend.rest.RegistrationDataTO;
import org.runningdinner.participant.Participant;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.runningdinner.test.util.TestUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(SpringExtension.class)
@ApplicationTest
class ParticipantPortalServiceTest {

  private static final String PARTICIPANT_EMAIL = "portal-test@example.com";
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
    RegistrationDataTO registrationData = TestUtil.createRegistrationData("Max Mustermann", PARTICIPANT_EMAIL, TestUtil.newAddress(), 6);
    frontendRunningDinnerService.performRegistration(runningDinner.getPublicSettings().getPublicId(), registrationData, false);

    String portalToken = participantPortalService.getOrCreatePortalToken(PARTICIPANT_EMAIL);

    // Validation is side-effect-free; event should be resolvable afterwards
    participantPortalService.validatePortalToken(portalToken);

    PortalMyEventsResponseTO myEvents = participantPortalService.resolveMyEvents(new PortalMyEventsRequestTO(portalToken));
    assertThat(myEvents.getEvents()).isNotEmpty();
    assertThat(myEvents.getEvents()).anyMatch(e -> e.getRole() == PortalRole.PARTICIPANT);
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
    PortalMyEventsResponseTO myEvents1 = participantPortalService.resolveMyEvents(new PortalMyEventsRequestTO(portalToken));
    assertThat(myEvents1.getEvents()).isNotEmpty();

    // Second call: idempotent — should not throw
    participantPortalService.performEventConfirmation(portalToken, publicId, participant.getId(), null);
    PortalMyEventsResponseTO myEvents2 = participantPortalService.resolveMyEvents(new PortalMyEventsRequestTO(portalToken));
    assertThat(myEvents2.getEvents()).isNotEmpty();
  }

  @Test
  void validatePortalToken_unknownToken_throws404() {
    assertThrows(PortalTokenNotFoundException.class,
        () -> participantPortalService.validatePortalToken("unknown-token-xyz"));
  }

  @Test
  void resolveMyEvents_unknownToken_throws404() {
    assertThrows(PortalTokenNotFoundException.class,
        () -> participantPortalService.resolveMyEvents(new PortalMyEventsRequestTO("unknown-token-xyz")));
  }
}
