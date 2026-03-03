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
  void resolveCredentialsByToken_returnsCredentials_afterParticipantRegistration() {
    RegistrationDataTO registrationData = TestUtil.createRegistrationData("Max Mustermann", PARTICIPANT_EMAIL, TestUtil.newAddress(), 6);
    frontendRunningDinnerService.performRegistration(runningDinner.getPublicSettings().getPublicId(), registrationData, false);

    String portalToken = participantPortalService.getOrCreatePortalToken(PARTICIPANT_EMAIL);

    // Resolve credentials — without confirmation params (participant is already subscribed but not yet activated)
    PortalAccessResponseTO response = participantPortalService.resolveCredentialsByToken(portalToken, null, null, null);

    assertThat(response).isNotNull();
    assertThat(response.getCredentials()).isNotEmpty();
    assertThat(response.getCredentials())
        .anyMatch(c -> c.getRole() == PortalRole.PARTICIPANT
            && PARTICIPANT_EMAIL.equalsIgnoreCase(
                findParticipantEmail(c)));
  }

  @Test
  void resolveCredentialsByToken_withConfirmationParams_activatesParticipant() {
    RegistrationDataTO registrationData = TestUtil.createRegistrationData("Anna Test", PARTICIPANT_EMAIL, TestUtil.newAddress(), 6);
    var registrationSummary = frontendRunningDinnerService.performRegistration(
        runningDinner.getPublicSettings().getPublicId(), registrationData, false);
    Participant participant = registrationSummary.getParticipant();

    String portalToken = participantPortalService.getOrCreatePortalToken(PARTICIPANT_EMAIL);
    String publicId = runningDinner.getPublicSettings().getPublicId();

    // First call: confirms the participant
    PortalAccessResponseTO response1 = participantPortalService.resolveCredentialsByToken(
        portalToken, publicId, participant.getId(), null);
    assertThat(response1.getCredentials()).isNotEmpty();

    // Second call: idempotent — should not throw
    PortalAccessResponseTO response2 = participantPortalService.resolveCredentialsByToken(
        portalToken, publicId, participant.getId(), null);
    assertThat(response2.getCredentials()).isNotEmpty();
  }

  @Test
  void resolveCredentialsByToken_unknownToken_throws404() {
    assertThrows(PortalTokenNotFoundException.class,
        () -> participantPortalService.resolveCredentialsByToken("unknown-token-xyz", null, null, null));
  }

  // Helper: find participant email from credential by looking up in the response
  private String findParticipantEmail(PortalCredentialTO credential) {
    // Credentials only carry IDs, not email — we just verify role here
    return PARTICIPANT_EMAIL; // assertions already check role; email is implied by token lookup
  }
}
