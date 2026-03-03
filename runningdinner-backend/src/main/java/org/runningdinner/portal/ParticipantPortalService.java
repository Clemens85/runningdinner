package org.runningdinner.portal;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.common.service.IdGenerator;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.core.RunningDinner;
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
   * Resolves all portal credentials for the email associated with this portal token.
   * Optionally performs an idempotent event confirmation:
   * <ul>
   *   <li>If {@code confirmPublicDinnerId} + {@code confirmParticipantId} are present →
   *       participant registration confirmation.</li>
   *   <li>If {@code confirmAdminId} is present → organizer email confirmation (acknowledged date).</li>
   * </ul>
   *
   * @throws PortalTokenNotFoundException if the token does not exist
   */
  @Transactional
  public PortalAccessResponseTO resolveCredentialsByToken(String portalToken,
                                                          String confirmPublicDinnerId,
                                                          UUID confirmParticipantId,
                                                          String confirmAdminId) {
    PortalToken token = portalTokenRepository.findByToken(portalToken)
        .orElseThrow(() -> new PortalTokenNotFoundException("No portal token found: " + portalToken));

    String email = token.getEmail();

    // Perform optional idempotent confirmation
    if (StringUtils.isNotBlank(confirmPublicDinnerId) && confirmParticipantId != null) {
      performParticipantConfirmation(confirmPublicDinnerId, confirmParticipantId);
    } else if (StringUtils.isNotBlank(confirmAdminId)) {
      performOrganizerConfirmation(confirmAdminId);
    }

    return buildCredentialsForEmail(email);
  }

  // ─── My Events ────────────────────────────────────────────────────────────

  /**
   * Resolves credentials from the request to live event summaries.
   * Unresolvable entries (deleted events, wrong IDs) are silently omitted.
   */
  @Transactional(readOnly = true)
  public PortalMyEventsResponseTO resolveMyEvents(PortalMyEventsRequestTO request) {
    if (request == null || request.getCredentials() == null || request.getCredentials().isEmpty()) {
      return new PortalMyEventsResponseTO(new ArrayList<>());
    }

    List<PortalEventEntryTO> events = new ArrayList<>();

    for (PortalCredentialTO credential : request.getCredentials()) {
      if (credential.getRole() == PortalRole.PARTICIPANT) {
        resolveParticipantEventEntry(credential).ifPresent(events::add);
      } else if (credential.getRole() == PortalRole.ORGANIZER) {
        resolveOrganizerEventEntry(credential).ifPresent(events::add);
      }
    }

    return new PortalMyEventsResponseTO(events);
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
      LOGGER.warn("Participant confirmation failed (may be already confirmed or invalid): publicDinnerId={}, participantId={}", publicDinnerId, participantId, e);
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
      LOGGER.warn("Organizer confirmation failed (may be already confirmed or invalid): adminId={}", adminId, e);
    }
  }

  private PortalAccessResponseTO buildCredentialsForEmail(String email) {
    List<PortalCredentialTO> credentials = new ArrayList<>();

    // Participant credentials: find all participants with this email across all dinners
    List<Participant> participants = participantService.findParticipantsAcrossAllDinnersByEmail(email);
    for (Participant participant : participants) {
      try {
        RunningDinner dinner = runningDinnerService.findRunningDinnerByAdminId(participant.getAdminId());
        credentials.add(PortalCredentialTO.forParticipant(
            dinner.getSelfAdministrationId(),
            participant.getId()
        ));
      } catch (Exception e) {
        LOGGER.warn("Could not resolve RunningDinner for participant {}: {}", participant.getId(), e.getMessage());
      }
    }

    // Organizer credentials: find all dinners organized by this email
    List<RunningDinner> organizedDinners = runningDinnerService.findRunningDinnersByOrganizerEmail(email);
    for (RunningDinner dinner : organizedDinners) {
      credentials.add(PortalCredentialTO.forOrganizer(dinner.getAdminId()));
    }

    return new PortalAccessResponseTO(credentials);
  }

  private Optional<PortalEventEntryTO> resolveParticipantEventEntry(PortalCredentialTO credential) {
    try {
      RunningDinner dinner = runningDinnerService.findRunningDinnerBySelfAdministrationId(credential.getSelfAdminId());
      // Verify participant exists
      participantService.findParticipantById(dinner.getAdminId(), credential.getParticipantId());
      return Optional.of(new PortalEventEntryTO(
          dinner.getTitle(),
          dinner.getDate(),
          dinner.getCity(),
          PortalRole.PARTICIPANT,
          null
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
      return Optional.of(new PortalEventEntryTO(
          dinner.getTitle(),
          dinner.getDate(),
          dinner.getCity(),
          PortalRole.ORGANIZER,
          adminUrl
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
