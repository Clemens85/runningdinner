package org.runningdinner.portal;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for the Participant Portal.
 * All HTTP concerns are handled here; business logic is delegated to {@link ParticipantPortalService}.
 */
@RestController
@RequestMapping(value = "/rest/participant-portal/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class ParticipantPortalRestController {

  private final ParticipantPortalService participantPortalService;

  public ParticipantPortalRestController(ParticipantPortalService participantPortalService) {
    this.participantPortalService = participantPortalService;
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

  /**
   * GET /rest/participant-portal/v1/{selfAdminId}/{participantId}/self-service-info?portalToken=...
   * <p>
   * Returns self-service availability flags for the given participant.
   * The portalToken is validated against the participant's email before any data is returned.
   *
   * @param selfAdminId   RunningDinner.selfAdministrationId
   * @param participantId Participant.id
   * @param portalToken   portal token — used as a safety guard to confirm the caller owns this participant
   */
  @GetMapping("/{selfAdminId}/{participantId}/self-service-info")
  public ParticipantSelfServiceInfoTO getParticipantSelfServiceInfo(
      @PathVariable UUID selfAdminId,
      @PathVariable UUID participantId,
      @RequestParam String portalToken) {
    return participantPortalService.resolveParticipantSelfServiceInfo(selfAdminId, participantId, portalToken);
  }

  /**
   * GET /rest/participant-portal/v1/{selfAdminId}/{participantId}/messages?portalToken=...
   * <p>
   * Returns organizer-sent messages (PARTICIPANT, TEAM, DINNER_ROUTE) for the given participant,
   * ordered by sent date descending (newest first).
   * The portalToken is validated against the participant's email before any data is returned.
   *
   * @param selfAdminId   RunningDinner.selfAdministrationId
   * @param participantId Participant.id
   * @param portalToken   portal token — used as a safety guard to confirm the caller owns this participant
   */
  @GetMapping("/{selfAdminId}/{participantId}/messages")
  public List<PortalMessageTO> getParticipantMessages(
      @PathVariable UUID selfAdminId,
      @PathVariable UUID participantId,
      @RequestParam String portalToken) {
    return participantPortalService.resolveParticipantMessages(selfAdminId, participantId, portalToken);
  }

  /**
   * POST /rest/participant-portal/v1/{selfAdminId}/{participantId}/messages/{messageTaskId}/read?portalToken=...
   * <p>
   * Records that the participant has read the given message. Idempotent — safe to call multiple times.
   * Fire-and-forget: always returns 204 No Content. If the message doesn't belong to this participant
   * the call is silently ignored.
   *
   * @param selfAdminId   RunningDinner.selfAdministrationId
   * @param participantId Participant.id
   * @param messageTaskId MessageTask.id
   * @param portalToken   portal token — used as a safety guard to confirm the caller owns this participant
   */
  @PostMapping("/{selfAdminId}/{participantId}/messages/{messageTaskId}/read")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void markMessageAsRead(
      @PathVariable UUID selfAdminId,
      @PathVariable UUID participantId,
      @PathVariable UUID messageTaskId,
      @RequestParam String portalToken) {
    participantPortalService.markMessageAsRead(selfAdminId, participantId, portalToken, messageTaskId);
  }
}
