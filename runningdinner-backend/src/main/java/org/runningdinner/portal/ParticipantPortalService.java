package org.runningdinner.portal;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.common.service.IdGenerator;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.util.LogSanitizer;
import org.runningdinner.frontend.FrontendRunningDinnerService;
import org.runningdinner.mail.MailService;
import org.runningdinner.mail.PortalTokenProvider;
import org.runningdinner.mail.formatter.ParticipantPortalAccessRecoveryMessageFormatter;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ParticipantPortalService implements PortalTokenProvider {

  private static final Logger LOGGER = LoggerFactory.getLogger(ParticipantPortalService.class);

  /** Minimum cooldown between recovery emails for the same address (1 hour). */
  private static final long RECOVERY_EMAIL_COOLDOWN_MINUTES = 60;

  private final PortalTokenRepository portalTokenRepository;
  private final ParticipantService participantService;
  private final RunningDinnerService runningDinnerService;
  private final FrontendRunningDinnerService frontendRunningDinnerService;
  private final IdGenerator idGenerator;
  private final UrlGenerator urlGenerator;
  private final MailService mailService;
  private final ParticipantPortalAccessRecoveryMessageFormatter recoveryMessageFormatter;

  public ParticipantPortalService(PortalTokenRepository portalTokenRepository,
                                  ParticipantService participantService,
                                  RunningDinnerService runningDinnerService,
                                  FrontendRunningDinnerService frontendRunningDinnerService,
                                  IdGenerator idGenerator,
                                  UrlGenerator urlGenerator,
                                  MailService mailService,
                                  ParticipantPortalAccessRecoveryMessageFormatter recoveryMessageFormatter) {
    this.portalTokenRepository = portalTokenRepository;
    this.participantService = participantService;
    this.runningDinnerService = runningDinnerService;
    this.frontendRunningDinnerService = frontendRunningDinnerService;
    this.idGenerator = idGenerator;
    this.urlGenerator = urlGenerator;
    this.mailService = mailService;
    this.recoveryMessageFormatter = recoveryMessageFormatter;
  }

  // ─── PortalTokenProvider (used by email formatters) ────────────────────────

  @Override
  @Transactional
  public String getOrCreatePortalToken(String email) {
    Assert.hasText(email, "email must not be empty");
    String normalizedEmail = StringUtils.trimToEmpty(email).toLowerCase();
    return portalTokenRepository.findByEmail(normalizedEmail)
        .map(PortalToken::getToken)
        .orElseGet(() -> createAndSaveNewToken(normalizedEmail));
  }

  // ─── Portal access via token ─────────────────────────────────────────────

  /**
   * Validates that the portal token exists. No side effects.
   * Safe to call from a GET endpoint — used by the activation page on first load.
   *
   * @throws PortalTokenNotFoundException if the token is unknown
   */
  @Transactional(readOnly = true)
  public void validatePortalToken(String portalToken) {
    portalTokenRepository.findByToken(portalToken)
        .orElseThrow(() -> new PortalTokenNotFoundException("Portal token not found"));
  }

  /**
   * Permanently deletes the portal token, invalidating all portal links for this email address.
   * Called by the "forget me" action. If the token is not found, this is a no-op — the user's
   * intent (revocation) is satisfied either way.
   * After this call the user must request a new access link via the recovery flow.
   */
  @Transactional
  public void revokePortalToken(String portalToken) {
    portalTokenRepository.findByToken(portalToken)
        .ifPresent(portalTokenRepository::delete);
  }

  /**
   * Validates the portal token and performs an idempotent event confirmation.
   * Must only be called from a POST endpoint so that email link-preview scanners
   * (which issue GET requests) cannot trigger confirmation without user intent.
   * <ul>
   *   <li>If {@code confirmPublicDinnerId} + {@code confirmParticipantId} are present →
   *       participant registration confirmation.</li>
   *   <li>If {@code confirmAdminId} is present → organizer email confirmation (acknowledged date).</li>
   * </ul>
   *
   * @throws PortalTokenNotFoundException if the token is unknown
   */
  @Transactional
  public void performEventConfirmation(String portalToken,
                                       String confirmPublicDinnerId,
                                       UUID confirmParticipantId,
                                       String confirmAdminId) {
    portalTokenRepository.findByToken(portalToken)
        .orElseThrow(() -> new PortalTokenNotFoundException("Portal token not found"));

    if (StringUtils.isNotBlank(confirmPublicDinnerId) && confirmParticipantId != null) {
      performParticipantConfirmation(confirmPublicDinnerId, confirmParticipantId);
    } else if (StringUtils.isNotBlank(confirmAdminId)) {
      performOrganizerConfirmation(confirmAdminId);
    }
  }

  // ─── My Events ────────────────────────────────────────────────────────────

  /**
   * Resolves all live event summaries for the email address bound to the given portal token.
   * The token is the only credential the client needs to hold — no raw adminIds or selfAdminIds
   * are stored or submitted by the frontend.
   * Unresolvable events (deleted, mismatched) are silently omitted.
   *
   * @throws PortalTokenNotFoundException if the token is unknown
   */
  @Transactional(readOnly = true)
  public PortalMyEventsResponseTO resolveMyEvents(PortalMyEventsRequestTO request) {
    PortalToken token = portalTokenRepository.findByToken(request.getPortalToken())
        .orElseThrow(() -> new PortalTokenNotFoundException("Portal token not found"));
    return buildEventEntriesForEmail(token.getEmail());
  }


  // ─── Access Recovery ─────────────────────────────────────────────────────

  /**
   * Sends a portal access recovery email if the given email is associated with any events.
   * <ul>
   *   <li>If no events (participant or organizer) exist for the email, silently returns — no token
   *       is created and no email is sent (prevents token pollution and email enumeration).</li>
   *   <li>If events exist, a portal token is looked up or created, cooldown is checked, and
   *       the recovery email is sent within the same transaction.</li>
   * </ul>
   * Always behaves generically to callers to prevent email enumeration.
   *
   * @param email the email to send recovery to
   */
  @Transactional
  public void requestAccessRecovery(String email) {
    if (StringUtils.isBlank(email)) {
      return;
    }
    String normalizedEmail = StringUtils.trimToEmpty(email).toLowerCase();

    // Only proceed if this email is actually associated with events
    if (!hasAnyEventsForEmail(normalizedEmail)) {
      LOGGER.warn("No events found for email {}, skipping recovery email", normalizedEmail);
      return;
    }

    // Look up or create the token (only now that we know events exist)
    PortalToken token = portalTokenRepository.findByEmail(normalizedEmail)
        .orElseGet(() -> {
          String newToken = idGenerator.generateAdminId();
          return portalTokenRepository.save(new PortalToken(normalizedEmail, newToken));
        });

    // Check cooldown
    if (isCooldownActive(token)) {
      LOGGER.warn("Recovery email cooldown active for email {}", normalizedEmail);
      return;
    }

    // Send recovery email
    try {
      String recoveryUrl = urlGenerator.constructPortalTokenUrl(token.getToken());
      var message = recoveryMessageFormatter.formatRecoveryMessage(normalizedEmail, recoveryUrl);
      var messageTask = mailService.newVirtualMessageTask(normalizedEmail, message);
      mailService.sendMessage(messageTask);
    } catch (Exception e) {
      LOGGER.error("Failed to send recovery email to {}", normalizedEmail, e);
      return;
    }

    token.setLastRecoveryEmailSentAt(LocalDateTime.now());
    portalTokenRepository.save(token);
  }

  // ─── Internal helpers ────────────────────────────────────────────────────

  private String createAndSaveNewToken(String normalizedEmail) {
    String token = idGenerator.generateAdminId();
    PortalToken portalToken = new PortalToken(normalizedEmail, token);
    portalTokenRepository.save(portalToken);
    return token;
  }

  private void performParticipantConfirmation(String publicDinnerId, UUID participantId) {
    try {
      frontendRunningDinnerService.activateSubscribedParticipant(publicDinnerId, participantId);
    } catch (Exception e) {
      // Idempotent — log but do not fail the portal access
      LOGGER.warn("Participant confirmation failed: publicDinnerId={}, participantId={}", publicDinnerId, participantId, e);
    }
  }

  private void performOrganizerConfirmation(String adminId) {
    try {
      RunningDinner dinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
      if (!dinner.isAcknowledged()) {
        runningDinnerService.acknowledgeRunningDinner(adminId, dinner.getObjectId(), LocalDateTime.now());
      }
    } catch (Exception e) {
      // Idempotent — log but do not fail the portal access
      LOGGER.warn("Organizer confirmation failed: adminId={}", LogSanitizer.sanitize(adminId), e);
    }
  }

  private PortalMyEventsResponseTO buildEventEntriesForEmail(String email) {
    List<PortalEventEntryTO> events = new ArrayList<>();

    // Participant events
    List<Participant> participants = participantService.findParticipantsAcrossAllDinnersByEmail(email);
    for (Participant participant : participants) {
      try {
        RunningDinner dinner = runningDinnerService.findRunningDinnerByAdminId(participant.getAdminId());
        PortalCredentialTO cred = PortalCredentialTO.forParticipant(dinner.getSelfAdministrationId(), participant.getId());
        resolveParticipantEventEntry(cred).ifPresent(events::add);
      } catch (Exception e) {
        LOGGER.warn("Could not resolve RunningDinner for participant {}: {}", participant.getId(), e.getMessage());
      }
    }

    // Organizer events
    List<RunningDinner> organizedDinners = runningDinnerService.findRunningDinnersByOrganizerEmail(email);
    for (RunningDinner dinner : organizedDinners) {
      PortalCredentialTO cred = PortalCredentialTO.forOrganizer(dinner.getAdminId());
      resolveOrganizerEventEntry(cred).ifPresent(events::add);
    }

    return new PortalMyEventsResponseTO(events);
  }

  private Optional<PortalEventEntryTO> resolveParticipantEventEntry(PortalCredentialTO credential) {
    try {
      RunningDinner dinner = runningDinnerService.findRunningDinnerBySelfAdministrationId(credential.getSelfAdminId());
      // Verify participant exists
      participantService.findParticipantById(dinner.getAdminId(), credential.getParticipantId());
      String publicUrl = urlGenerator.constructPublicDinnerUrl(dinner.getPublicSettings().getPublicId());
      return Optional.of(new PortalEventEntryTO(
          dinner.getTitle(),
          dinner.getDate(),
          dinner.getCity(),
          PortalRole.PARTICIPANT,
          null,
          publicUrl
      ));
    } catch (Exception e) {
      LOGGER.debug("Silently omitting unresolvable participant credential selfAdminId={}: {}",
          credential.getSelfAdminId(), e.getMessage());
      return Optional.empty();
    }
  }

  private Optional<PortalEventEntryTO> resolveOrganizerEventEntry(PortalCredentialTO credential) {
    try {
      RunningDinner dinner = runningDinnerService.findRunningDinnerByAdminId(credential.getAdminId());
      String adminUrl = urlGenerator.constructAdministrationUrl(dinner.getAdminId());
      String publicUrl = urlGenerator.constructPublicDinnerUrl(dinner.getPublicSettings().getPublicId());
      return Optional.of(new PortalEventEntryTO(
          dinner.getTitle(),
          dinner.getDate(),
          dinner.getCity(),
          PortalRole.ORGANIZER,
          adminUrl,
          publicUrl
      ));
    } catch (Exception e) {
      LOGGER.debug("Silently omitting unresolvable organizer credential adminId={}: {}",
          credential.getAdminId(), e.getMessage());
      return Optional.empty();
    }
  }

  private boolean hasAnyEventsForEmail(String email) {
    List<Participant> participants = participantService.findParticipantsAcrossAllDinnersByEmail(email);
    if (!participants.isEmpty()) {
      return true;
    }
    List<RunningDinner> organizedDinners = runningDinnerService.findRunningDinnersByOrganizerEmail(email);
    return !organizedDinners.isEmpty();
  }

  private static boolean isCooldownActive(PortalToken token) {
    LocalDateTime lastSent = token.getLastRecoveryEmailSentAt();
    if (lastSent == null) {
      return false;
    }
    return lastSent.plusMinutes(RECOVERY_EMAIL_COOLDOWN_MINUTES).isAfter(LocalDateTime.now());
  }
}
