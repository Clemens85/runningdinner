package org.runningdinner.portal;

import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST controller for the Participant Portal.
 * All HTTP concerns are handled here; business logic is delegated to {@link ParticipantPortalService}.
 */
@RestController
@RequestMapping(value = "/rest/participant-portal/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class ParticipantPortalServiceRest {

  private final ParticipantPortalService participantPortalService;

  public ParticipantPortalServiceRest(ParticipantPortalService participantPortalService) {
    this.participantPortalService = participantPortalService;
  }

  /**
   * GET /rest/participant-portal/v1/token/{portalToken}
   * <p>
   * Resolves all portal credentials for the email tied to this token.
   * Optionally performs an idempotent event confirmation when confirmation params are present.
   *
   * @param portalToken         the portal token embedded in the email link
   * @param confirmPublicDinnerId  optional — triggers participant confirmation
   * @param confirmParticipantId   optional — required together with confirmPublicDinnerId
   * @param confirmAdminId         optional — triggers organizer email confirmation
   * @return all portal credentials for the email
   */
  @GetMapping("/token/{portalToken}")
  public PortalAccessResponseTO resolveByToken(
      @PathVariable String portalToken,
      @RequestParam(required = false) String confirmPublicDinnerId,
      @RequestParam(required = false) UUID confirmParticipantId,
      @RequestParam(required = false) String confirmAdminId) {

    return participantPortalService.resolveCredentialsByToken(
        portalToken, confirmPublicDinnerId, confirmParticipantId, confirmAdminId);
  }

  /**
   * POST /rest/participant-portal/v1/my-events
   * <p>
   * Accepts a list of portal credentials and returns live event summaries.
   * Unresolvable events are silently omitted.
   *
   * @param request the credential list (may be empty)
   * @return live event summaries
   */
  @PostMapping("/my-events")
  public PortalMyEventsResponseTO resolveMyEvents(@Valid @RequestBody PortalMyEventsRequestTO request) {
    return participantPortalService.resolveMyEvents(request);
  }

  /**
   * POST /rest/participant-portal/v1/access-recovery
   * <p>
   * Triggers a recovery email for the given email address (if events exist and cooldown elapsed).
   * Always returns 204 No Content to prevent email enumeration.
   *
   * @param request JSON body containing the email address
   */
  @PostMapping("/access-recovery")
  @ResponseStatus(org.springframework.http.HttpStatus.NO_CONTENT)
  public void requestAccessRecovery(@Valid @RequestBody AccessRecoveryRequestTO request) {
    participantPortalService.requestAccessRecovery(request.getEmail());
  }
}
