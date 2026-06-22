package org.runningdinner.portal;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

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
   * Validates the portal token. No side effects — confirmation is intentionally absent so that
   * email link-preview scanners (which issue GET requests) cannot trigger confirmation
   * without user intent.
   * Returns 204 No Content on success; 404 if the token is unknown.
   */
  @GetMapping("/token/{portalToken}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void validateToken(@PathVariable String portalToken) {
    participantPortalService.validatePortalToken(portalToken);
  }

  /**
   * POST /rest/participant-portal/v1/token/revoke
   * <p>
   * Permanently revokes all supplied portal tokens, invalidating portal links for the associated
   * email addresses. Called by the "forget me on this device" action.
   * Always returns 204 — tokens not found are silently ignored.
   */
  @PostMapping("/token/revoke")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void revokeTokens(@Valid @RequestBody PortalRevokeRequestTO request) {
    participantPortalService.revokePortalTokens(request.getPortalTokens());
  }

  /**
   * POST /rest/participant-portal/v1/token/{portalToken}/confirm
   * <p>
   * Performs an idempotent event confirmation (participant activation or organizer acknowledgement).
   * Separated from the GET so that email link-preview scanners cannot trigger it.
   * Returns 204 No Content; 404 if the token is unknown.
   */
  @PostMapping("/token/{portalToken}/confirm")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void confirmEvent(@PathVariable String portalToken,
                           @Valid @RequestBody PortalConfirmRequestTO request) {
    participantPortalService.performEventConfirmation(
        portalToken,
        request.getConfirmPublicDinnerId(),
        request.getConfirmParticipantId(),
        request.getConfirmAdminId());
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
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void requestAccessRecovery(@Valid @RequestBody AccessRecoveryRequestTO request) {
    participantPortalService.requestAccessRecovery(request.getEmail());
  }
}
