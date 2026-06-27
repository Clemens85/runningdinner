package org.runningdinner.portal;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.Strings;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.activity.ActivityService;
import org.runningdinner.admin.activity.ActivityType;
import org.runningdinner.common.service.IdGenerator;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.util.LogSanitizer;
import org.runningdinner.mail.MailService;
import org.runningdinner.mail.PortalTokenProvider;
import org.runningdinner.mail.formatter.ParticipantPortalAccessRecoveryMessageFormatter;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ParticipantPortalService implements PortalTokenProvider {

  private static final Logger LOGGER = LoggerFactory.getLogger(ParticipantPortalService.class);

  /** Minimum cooldown between recovery emails for the same address (1 hour). */
  private static final long RECOVERY_EMAIL_COOLDOWN_MINUTES = 60;

  private final PortalTokenRepository portalTokenRepository;
  private final ParticipantService participantService;
  private final RunningDinnerService runningDinnerService;
  private final IdGenerator idGenerator;
  private final UrlGenerator urlGenerator;
  private final MailService mailService;
  private final ParticipantPortalAccessRecoveryMessageFormatter recoveryMessageFormatter;
  private final TeamService teamService;
  private final ActivityService activityService;

  public ParticipantPortalService(PortalTokenRepository portalTokenRepository,
                                  ParticipantService participantService,
                                  RunningDinnerService runningDinnerService,
                                  IdGenerator idGenerator,
                                  UrlGenerator urlGenerator,
                                  MailService mailService,
                                  ParticipantPortalAccessRecoveryMessageFormatter recoveryMessageFormatter,
                                  TeamService teamService,
                                  ActivityService activityService) {
    this.portalTokenRepository = portalTokenRepository;
    this.participantService = participantService;
    this.runningDinnerService = runningDinnerService;
    this.idGenerator = idGenerator;
    this.urlGenerator = urlGenerator;
    this.mailService = mailService;
    this.recoveryMessageFormatter = recoveryMessageFormatter;
    this.teamService = teamService;
    this.activityService = activityService;
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

  // ─── Portal token revocation ─────────────────────────────────────────────

  /**
   * Permanently deletes all supplied portal tokens. Tokens not found are silently ignored.
   * Called by the "forget me" action.
   */
  @Transactional
  public void revokePortalTokens(List<String> portalTokens) {
    for (String token : portalTokens) {
      portalTokenRepository.findByToken(token).ifPresent(portalTokenRepository::delete);
    }
  }

  // ─── My Events ────────────────────────────────────────────────────────────

  /**
   * Resolves all live event summaries for the email address bound to the given portal token.
   * The token is the only credential the client needs to hold — no raw adminIds or selfAdminIds
   * are stored or submitted by the frontend.
   * Unresolvable events (deleted, mismatched) are silently omitted.
   */
  @Transactional(readOnly = true)
  public PortalMyEventsResponseTO resolveMyEvents(PortalMyEventsRequestTO request) {
    // Accumulate by adminId across ALL tokens so same dinner from two different email/token
    // combinations (e.g. one participant token + one organizer token) gets merged into one entry.
    Map<String, List<PortalEventEntryTO>> eventsByAdminId = new LinkedHashMap<>();

    for (String tokenStr : request.getPortalTokens()) {
      Optional<PortalToken> tokenOpt = portalTokenRepository.findByToken(tokenStr);
      if (tokenOpt.isEmpty()) {
        LOGGER.debug("Skipping unknown portal token during my-events resolution");
        continue;
      }
      Map<String, List<PortalEventEntryTO>> resolvedForToken = buildEventEntriesForEmail(tokenOpt.get().getEmail(), tokenStr);
      for (var entry : resolvedForToken.entrySet()) {
        eventsByAdminId.computeIfAbsent(entry.getKey(), k -> new ArrayList<>()).addAll(entry.getValue());
      }
    }

    List<PortalEventEntryTO> events = new ArrayList<>();
    for (var entry : eventsByAdminId.entrySet()) {
      List<PortalEventEntryTO> entriesForDinner = entry.getValue();
      events.add(entriesForDinner.size() > 1 ? mergePortalEventEntries(entriesForDinner) : entriesForDinner.getFirst());
    }
    return new PortalMyEventsResponseTO(events);
  }

	private PortalEventEntryTO mergePortalEventEntries(List<PortalEventEntryTO> portalEventEntries) {
    String publicUrl = portalEventEntries.stream()
        .map(PortalEventEntryTO::getPublicUrl)
        .filter(StringUtils::isNotBlank)
        .findFirst()
        .orElse(null);
    List<PortalRole> roles = portalEventEntries.stream()
        .flatMap(e -> e.getRoles().stream())
        .distinct()
        .collect(Collectors.toList());

    Map<PortalRole, PortalCredentialTO> credentials = portalEventEntries.stream()
        .flatMap(e -> e.getCredentials().entrySet().stream())
        .collect(Collectors.toMap(
            Map.Entry::getKey,
            Map.Entry::getValue,
            (existing, replacement) -> existing
        ));
    return new PortalEventEntryTO(
        portalEventEntries.getFirst().getEventName(),
        portalEventEntries.getFirst().getEventDate(),
        portalEventEntries.getFirst().getCity(),
        publicUrl,
        roles,
        credentials
    );
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

  private Map<String, List<PortalEventEntryTO>> buildEventEntriesForEmail(String email, String portalToken) {
    Map<String, List<PortalEventEntryTO>> result = new LinkedHashMap<>();

    // Participant events
    List<Participant> participants = participantService.findParticipantsAcrossAllDinnersByEmail(email);
    for (Participant participant : participants) {
      try {
        if (!participant.isActivated()) {
          LOGGER.warn("For security reasons we won't resolve not activated participants in portal. Email was {} for participant-id {}",
                      LogSanitizer.sanitize(email), participant.getId());
          continue;
        }
        RunningDinner dinner = runningDinnerService.findRunningDinnerByAdminId(participant.getAdminId());
        PortalCredentialTO cred = PortalCredentialTO.forParticipant(portalToken, dinner.getSelfAdministrationId(), participant.getId());
        result.computeIfAbsent(dinner.getAdminId(), k -> new ArrayList<>()).add(newParticipantEventEntry(cred, dinner));
      } catch (Exception e) {
        LOGGER.warn("Could not resolve RunningDinner for participant {}: {}", participant.getId(), e.getMessage());
      }
    }

    // Organizer events
    List<RunningDinner> organizedDinners = runningDinnerService.findRunningDinnersByOrganizerEmail(email);
    for (RunningDinner runningDinner : organizedDinners) {
      if (!runningDinner.isAcknowledged()) {
        LOGGER.warn("For security reasons we won't resolve not acknowledged organizers in portal. Email was {} for admin-id {}",
                    LogSanitizer.sanitize(email), runningDinner.getAdminId());
        continue;
      }
      String adminUrl = getAdminUrl(runningDinner);
      PortalCredentialTO cred = PortalCredentialTO.forOrganizer(portalToken, runningDinner.getAdminId(), adminUrl);
      result.computeIfAbsent(runningDinner.getAdminId(), k -> new ArrayList<>()).add(newOrganizerEventEntry(cred, runningDinner));
    }

    return result;
  }

  private PortalEventEntryTO newParticipantEventEntry(PortalCredentialTO credential, RunningDinner runningDinner) {
    String publicUrl = getPublicUrl(runningDinner);
    return new PortalEventEntryTO(
            getTitle(runningDinner),
            runningDinner.getDate(),
            runningDinner.getCity(),
            publicUrl,
            List.of(PortalRole.PARTICIPANT),
            Map.of(PortalRole.PARTICIPANT, credential)
    );
  }

  private PortalEventEntryTO newOrganizerEventEntry(PortalCredentialTO credential, RunningDinner runningDinner) {
    String publicUrl = getPublicUrl(runningDinner);
    return new PortalEventEntryTO(
            getTitle(runningDinner),
            runningDinner.getDate(),
            runningDinner.getCity(),
            publicUrl,
            List.of(PortalRole.ORGANIZER),
            Map.of(PortalRole.ORGANIZER, credential)
    );
  }

  private String getPublicUrl(RunningDinner runningDinner) {
    if (runningDinner.getRegistrationType() != RegistrationType.CLOSED) {
      return urlGenerator.constructPublicDinnerUrl(runningDinner.getPublicSettings().getPublicId());
    }
    return null;
  }

  private String getAdminUrl(RunningDinner runningDinner) {
    return urlGenerator.constructAdministrationUrl(runningDinner.getAdminId());
  }

  private String getTitle(RunningDinner runningDinner) {
    if (runningDinner.getRegistrationType() != RegistrationType.CLOSED) {
        return runningDinner.getPublicSettings().getPublicTitle();
    }
    return runningDinner.getTitle();
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

  // ─── Participant Self-Service Info ────────────────────────────────────────

  /**
   * Returns self-service availability info for a specific participant.
   * The portalToken is validated against the participant's email before any data is returned.
   * {@link TeamSelfServiceInfo} is only populated when the participant is assigned to a team AND
   * at least one TEAM mail was sent to all recipients (signalling the team arrangement is fixed).
   *
   * @param selfAdminId   RunningDinner.selfAdministrationId
   * @param participantId Participant.id
   * @param portalToken   the caller's portal token (safety guard)
   * @throws IllegalArgumentException when the token does not match the participant's email
   */
  @Transactional(readOnly = true)
  public ParticipantSelfServiceInfoTO resolveParticipantSelfServiceInfo(UUID selfAdminId, UUID participantId, String portalToken) {

    PortalToken token = portalTokenRepository.findByToken(portalToken)
        .orElseThrow(() -> new IllegalArgumentException("Unknown portal token"));

    RunningDinner runningDinner = runningDinnerService.findRunningDinnerBySelfAdministrationId(selfAdminId);
    Participant participant = participantService.findParticipantById(runningDinner.getAdminId(), participantId);

    String participantEmail = StringUtils.trimToEmpty(participant.getEmail()).toLowerCase();
    String tokenEmail = StringUtils.trimToEmpty(token.getEmail()).toLowerCase();
    Assert.state(participantEmail.equals(tokenEmail),
        "Portal token email does not match participant email for participantId=" + participantId);

    boolean dinnerRouteAvailable = isDinnerRouteAvailable(runningDinner.getAdminId(), participantEmail);

    TeamSelfServiceInfo teamSelfServiceInfo = resolveTeamSelfServiceInfo(runningDinner, selfAdminId, participantId);
    return new ParticipantSelfServiceInfoTO(teamSelfServiceInfo, dinnerRouteAvailable);
  }

  private boolean isDinnerRouteAvailable(String adminId, String participantEmailLowerCased) {

    return activityService.findActivitiesByTypes(adminId, ActivityType.DINNERROUTE_MAIL_SENT)
        .stream()
        .findAny()
        .isPresent();
  }

  /**
   * Resolves {@link TeamSelfServiceInfo} for the given participant.
   * Returns non-null only if the participant is assigned to a team AND at least one TEAM mail
   * was sent to all recipients (indicated by a {@link ActivityType#TEAMARRANGEMENT_MAIL_SENT} activity).
   */
  private TeamSelfServiceInfo resolveTeamSelfServiceInfo(RunningDinner runningDinner, UUID selfAdminId, UUID participantId) {

    boolean teamMailsSent = activityService.findActivitiesByTypes(runningDinner.getAdminId(), ActivityType.TEAMARRANGEMENT_MAIL_SENT)
        .stream()
        .findAny()
        .isPresent();
    if (!teamMailsSent) {
      return null;
    }

    Optional<Team> teamOpt = teamService.findTeamByParticipantId(runningDinner.getAdminId(), participantId);
    if (teamOpt.isEmpty()) {
      return null;
    }

    Team team = teamOpt.get();
    String mealLabel = team.getMealClass().getLabel();
    LocalDateTime mealTime = team.getMealClass().getTime();

    Participant viewingParticipant = team.getTeamMemberByParticipantId(participantId);
    Participant host = team.getHostTeamMember();
    String hostName = host.getName().getFullnameFirstnameFirst();
    boolean selfIsHost = host.getId().equals(participantId);

    Set<Participant> partners = team.getTeamMembersExcluding(viewingParticipant);
    Participant teamPartner = partners.stream().findFirst().orElse(null);

    TeamSelfServiceInfo result = new TeamSelfServiceInfo();
    result.setMealLabel(mealLabel);
    result.setMealTime(mealTime);
    result.setHostName(hostName);
    result.setSelfIsHost(selfIsHost);

    if (teamPartner == null) {
      result.setTeamPartnerCancelled(true);
      return result; // Special case when there is no team partner (which means it is likely cancelled)
    }

    boolean fixedTeamPartner = teamPartner.isTeamPartnerWishRegistrationChildOf(viewingParticipant);

    String teamPartnerEmail = StringUtils.trimToNull(teamPartner.getEmail());
    String teamPartnerMobileNumber = StringUtils.trimToNull(teamPartner.getMobileNumber());
    if (fixedTeamPartner) {
      // For fixed partners: only show email and/or mobile phone when it differs from the viewing participant's own data:
      teamPartnerEmail = Strings.CI.equals(StringUtils.trim(viewingParticipant.getEmail()), StringUtils.trim(teamPartnerEmail)) ? null : teamPartnerEmail;
      teamPartnerMobileNumber = Strings.CI.equals(StringUtils.trim(viewingParticipant.getMobileNumber()), StringUtils.trim(teamPartnerMobileNumber)) ? null : teamPartnerMobileNumber;
    }

    result.setManageTeamHostingUrl(urlGenerator.constructManageTeamHostUrl(selfAdminId, team.getId(), participantId));
    result.setTeamPartnerName(teamPartner.getName().getFullnameFirstnameFirst());
    result.setTeamPartnerEmail(teamPartnerEmail);
    result.setTeamPartnerMobileNumber(teamPartnerMobileNumber);
    result.setFixedTeamPartner(fixedTeamPartner);
    if (!fixedTeamPartner) {
      result.setTeamPartnerMealSpecifics(teamPartner.getMealSpecifics().createDetachedClone());
    }

    return result;
  }
}
