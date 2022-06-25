package org.runningdinner.admin.activity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.admin.message.job.MessageJob;
import org.runningdinner.admin.message.job.MessageType;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.util.CoreUtil;
import org.runningdinner.event.RunningDinnerSettingsUpdatedEvent;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamCancellationResult;
import org.runningdinner.participant.TeamStatus;
import org.runningdinner.participant.rest.TeamTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ActivityService {
  
  public static final int PARTICIPANT_ACTIVITES_PAGE_SIZE = 18;
  
  public static final String TEAM_MEMBERS_SWAPPED_HEADLINE = "Team Mitglieder getauscht";
  public static final String TEAM_HOST_CHANGED_BY_ADMIN_HEADLINE = "Gastgeber geändert";
  
  static final Collection<ActivityType> ADMIN_ACTIVITY_TYPES =
          Arrays.asList(
              ActivityType.DINNER_CREATED,
              ActivityType.DINNER_CANCELLED,
              ActivityType.DINNERROUTE_MAIL_SENT,
              ActivityType.TEAMARRANGEMENT_MAIL_SENT,
              ActivityType.PARTICIPANT_MAIL_SENT,
              ActivityType.MESSAGE_JOB_SENDING_FAILED,
              ActivityType.TEAM_ARRANGEMENT_CREATED,
              ActivityType.TEAMS_RECREATED,
              ActivityType.CUSTOM_ADMIN_CHANGE,
              ActivityType.MEAL_TIMES_UPDATED,
              ActivityType.PARTICIPANT_CHANGED_TEAMHOST,
              ActivityType.WAITINGLIST_PARTICIPANTS_ASSIGNED,
              ActivityType.WAITINGLIST_TEAMS_GENERATED
          );

      static final Collection<ActivityType> PARTICIPANT_ACTIVITY_TYPES =
          Arrays.asList(
              ActivityType.PARTICIPANT_SUBSCRIBED,
              ActivityType.PARTICIPANT_UNSUBSCRIBED
              );
  
  private static final String NEW_RUNNING_DINNER_MESSAGE_TEMPLATE = "Du hast dieses Running Dinner unter der Email-Addresse <strong>{email}</strong> angelegt.";

  private static final String PARTICIPANT_SUBSCRIBED_MESSAGE_TEMPLATE = "{participantName} hat sich angemeldet";
  
  private static final String MEAL_TIMES_UPDATED_MESSAGE_TEMPLATE = "Du hast die Uhrzeiten für die einzelnen Speisen geändert.";

  private static final String TEAM_ARRANGEMENT_CREATED_DINNER_MESSAGE_TEMPLATE = "Du hast die Team-Einteilungen für <strong>{numTeams}</strong> Teams vorgenommen.";
  
  private static final String TEAMS_RECREATED_DINNER_MESSAGE_TEMPLATE = "Du hast die alten Team-Einteilungen gelöscht und neue Team-Einteilungen vorgenommen, mit nun <strong>{numTeams}</strong> Teams."; 
  
  private static final String TEAM_MEMBERS_SWAPPED_MESSAGE_TEMPLATE = "Du hast zwischen Team {teamNumber1} und Team {teamNumber2} folgende Teilnehmer getauscht: {participantName1} und {participantName2}.";
  
  private static final String TEAMS_HOST_CHANGED_DINNER_MESSAGE_TEMPLATE = "Du hast für Team {teamNumber} den Gastgeber auf {participantName} geändert.";
  
  private static final String TEAMS_HOST_CHANGED_BY_PARTICIPANT_DINNER_MESSAGE_TEMPLATE = "<strong>{originator}</strong> hat für Team {teamNumber} den Gastgeber auf {participantName} geändert.";
  
  private static final String TEAM_CANCELLED_NO_REPLACEMENT_MESSAGE_TEMPLATE = "Folgende Teilnehmer sind abgesprungen und wurden nicht ersetzt:<br>{participantName}";
  
  private static final String TEAM_CANCELLED_REPLACED_MESSAGE_TEMPLATE = "Folgende Teilnehmer wurden ersetzt:<br>{participantName}";

  private static final String TEAM_ARRANGEMENT_MAIL_SENT_MESSAGE_TEMPLATE = "Du hast insgesamt {numSentMails} Emails mit Infos über die <strong>Teameinteilungen</strong> versandt.";
  
  private static final String DINNER_ROUTE_MAIL_SENT_MESSAGE_TEMPLATE = "Du hast insgesamt {numSentMails} Emails mit Infos über die <strong>Dinner Routen</strong> versandt.";
  
  private static final String PARTICIPANT_MAIL_SENT_MESSAGE_TEMPLATE = "Du hast insgesamt <strong>{numSentMails}</strong> Emails (Rundmails) an Einzelteilnehmer versandt.";
  
  private static final String RUNNING_DINNER_CANCELLED_MESSAGE_TEMPLATE = "Du hast dieses Running Dinner endgültig abgesagt. Es wird demnächst automatisch gelöscht.";

  private static final String RUNNING_DINNER_BASIC_SETTINGS_EDITED_TEMPLATE = "Du hast die Basis Einstellungen deines Running Dinners nachträglich bearbeitet.";
  
  private static final String RUNNING_DINNER_PUBLIC_SETTINGS_EDITED_TEMPLATE = "Du hast die öffentlichen Einstellungen deines Running Dinners nachträglich bearbeitet.";

  private static final String RUNNING_DINNER_REGISTRATION_DEACTIVATED = "Du hast die Registrierung für dein Event deaktiviert, damit kann sich ab jetzt kein Teilnehmer mehr selbst anmelden.";

  private static final String RUNNING_DINNER_REGISTRATION_ACTIVATED = "Du hast die Registrierung für dein Event wieder aktiviert, damit können sich ab jetzt Teilnehmer wieder selbst anmelden.";
  
  private static final String WAITINGLIST_PARTICIPANTS_ASSIGNED_TEMPLATE = "Du hast {numTeams} mit Teilnehmern von der Warteliste aufgefüllt.";
  
  private static final String WAITINGLIST_TEAMS_GENERATED_TEMPLATE = "Du hast {numTeams} von der Warteliste generiert";
  
	private static final Logger LOGGER = LoggerFactory.getLogger(ActivityService.class);
  
  @Autowired
  private ActivityRepository activityRepository;
  
  @Transactional
  public Activity createActivityForNewRunningDinner(RunningDinner runningDinner) {

    LocalDateTime activityDate = runningDinner.getCreatedAt();

    Activity result = new Activity(activityDate, ActivityType.DINNER_CREATED, runningDinner.getEmail(), runningDinner);
    result.setActivityHeadline("Running Dinner erstellt");
    result.setActivityMessage(NEW_RUNNING_DINNER_MESSAGE_TEMPLATE.replaceAll("\\{email\\}", runningDinner.getEmail()));
    result = activityRepository.save(result);
    return result;
  }

  @Transactional
  public Activity createActivityForNewParticipant(Participant participant, RunningDinner runningDinner) {

    Activity result = new Activity(participant.getCreatedAt(), ActivityType.PARTICIPANT_SUBSCRIBED, participant.getEmail(), runningDinner);
    result.setActivityMessage(replaceParticipantName(PARTICIPANT_SUBSCRIBED_MESSAGE_TEMPLATE, participant.getName().getFullnameFirstnameFirst()));
    result.setActivityHeadline("Neue Anmeldung");
    result.setRelatedEntityId(participant.getId());
    result.setRelatedEntityType(RelatedEntityType.PARTICIPANT);
    result = activityRepository.save(result);
    return result;
  }
  
  @Transactional
  public Activity createActivityForMealTimesUpdated(RunningDinner runningDinner) {
  
    Activity result = new Activity(LocalDateTime.now(), ActivityType.MEAL_TIMES_UPDATED, runningDinner.getEmail(), runningDinner);
    result.setActivityHeadline("Zeitplan geändert");
    result.setActivityMessage(MEAL_TIMES_UPDATED_MESSAGE_TEMPLATE);
    result = activityRepository.save(result);
    return result;
  }
  
  @Transactional
  public Activity createActivityForTeamsArranged(List<Team> teams, RunningDinner runningDinner) {
  
    LocalDateTime activityDate = LocalDateTime.now();
    int numTeams = 0;
  
    if (CoreUtil.isNotEmpty(teams)) {
      numTeams = teams.size();
      Team lastCreatedTeam = teams.get(numTeams - 1);
      activityDate = lastCreatedTeam.getModifiedAt();
    }
    Activity result = new Activity(activityDate, ActivityType.TEAM_ARRANGEMENT_CREATED, runningDinner.getEmail(), runningDinner);
    result.setActivityMessage(TEAM_ARRANGEMENT_CREATED_DINNER_MESSAGE_TEMPLATE.replaceAll("\\{numTeams\\}", String.valueOf(numTeams)));
    result.setActivityHeadline("Team Einteilungen vorgenommen");
    result = activityRepository.save(result);
    return result;
  }
  
  @Transactional
  public Activity createActivityForTeamsReCreated(List<Team> teams, RunningDinner runningDinner) {
    
    LocalDateTime activityDate = LocalDateTime.now();
    int numTeams = 0;
  
    if (CoreUtil.isNotEmpty(teams)) {
      numTeams = teams.size();
      Team lastCreatedTeam = teams.get(numTeams - 1);
      activityDate = lastCreatedTeam.getModifiedAt();
    }
    Activity result = new Activity(activityDate, ActivityType.TEAMS_RECREATED, runningDinner.getEmail(), runningDinner);
    result.setActivityMessage(TEAMS_RECREATED_DINNER_MESSAGE_TEMPLATE.replaceAll("\\{numTeams\\}", String.valueOf(numTeams)));
    result.setActivityHeadline("Teams neu generiert");
    result = activityRepository.save(result);
    return result;
  }
  
  @Transactional
  public Activity createActivityForWaitingListParticipantsAssigned(List<Team> teams, RunningDinner runningDinner) {
    
  	AffectedTeamsInfo affectedTeamsInfo = new AffectedTeamsInfo(teams);
    Activity result = new Activity(affectedTeamsInfo.getActivityDate(), ActivityType.WAITINGLIST_PARTICIPANTS_ASSIGNED, runningDinner.getEmail(), runningDinner);
    result.setActivityMessage(getActivityMessageForWaitingListParticipantsAssigned(WAITINGLIST_PARTICIPANTS_ASSIGNED_TEMPLATE, affectedTeamsInfo));
    result.setActivityHeadline("Teams durch Teilnehmer der Warteliste aufgefüllt");
    result = activityRepository.save(result);
    return result;
  }
  
  @Transactional
  public Activity createActivityForWaitingListTeamsGenerated(List<TeamTO> teams, RunningDinner runningDinner) {
    
    Activity result = new Activity(LocalDateTime.now(), ActivityType.WAITINGLIST_TEAMS_GENERATED, runningDinner.getEmail(), runningDinner);
    result.setActivityMessage(getActivityMessageForWaitingListTeamsGenerated(WAITINGLIST_TEAMS_GENERATED_TEMPLATE, teams.size()));
    result.setActivityHeadline("Teams von Warteliste hinzugefügt");
    result = activityRepository.save(result);
    return result;
  }
  
  @Transactional
  public Activity createActivityForTeamMembersSwapped(Participant firstParticipant, Participant secondParticipant,
      List<Team> affectedParentTeams, RunningDinner runningDinner) {
  
    Activity result = new Activity(LocalDateTime.now(), ActivityType.CUSTOM_ADMIN_CHANGE, runningDinner.getEmail(), runningDinner);
    
    List<String> affectedParentTeamNumbers = getTeamNumbers(affectedParentTeams);
    
    String activityMessage = TEAM_MEMBERS_SWAPPED_MESSAGE_TEMPLATE.replaceAll("\\{teamNumber1\\}", affectedParentTeamNumbers.get(0));
    activityMessage = activityMessage.replaceAll("\\{teamNumber2\\}", affectedParentTeamNumbers.get(1));
    activityMessage = activityMessage.replaceAll("\\{participantName1\\}",  firstParticipant.getName().getFullnameFirstnameFirst());
    activityMessage = activityMessage.replaceAll("\\{participantName2\\}",  secondParticipant.getName().getFullnameFirstnameFirst());
    result.setActivityMessage(activityMessage);
    
    result.setActivityHeadline(TEAM_MEMBERS_SWAPPED_HEADLINE);
    
    result = activityRepository.save(result);
    return result;
  }
  
  @Transactional
  public Activity createActivityForTeamCancellation(TeamCancellationResult teamCancellationResult, RunningDinner runningDinner) {
  
    Activity result = new Activity(LocalDateTime.now(), ActivityType.CUSTOM_ADMIN_CHANGE, runningDinner.getEmail(), runningDinner);
    
    String removedParticipantNames = teamCancellationResult.getRemovedParticipants().stream()
                        .map(p -> p.getName().getFullnameFirstnameFirst())
                        .collect(Collectors.joining(","));
  
    String template = teamCancellationResult.getTeam().getStatus() == TeamStatus.CANCELLED ? TEAM_CANCELLED_NO_REPLACEMENT_MESSAGE_TEMPLATE : TEAM_CANCELLED_REPLACED_MESSAGE_TEMPLATE;
    result.setActivityMessage(replaceParticipantName(template, removedParticipantNames));
    
    String activityHeadline = "Team {teamNumber} durch neue Teilnehmer ersetzt";
    if (TeamStatus.CANCELLED == teamCancellationResult.getTeam().getStatus()) {
      activityHeadline = "Team {teamNumber} komplett abgesagt";
    }
    result.setActivityHeadline(replaceTeamNumber(activityHeadline, teamCancellationResult.getTeam()));
    
    return activityRepository.save(result);
  }

  @Transactional
  public Activity createActivityForNewMessageJob(MessageJob messageJob) {

    ActivityType activityType = mapActivityType(messageJob);
    String originator = messageJob.getRunningDinner().getEmail();
    Activity activity = new Activity(messageJob.getCreatedAt(), activityType, originator, messageJob.getRunningDinner());

    String activityMessage = mapMessageTemplate(messageJob);
    activityMessage = activityMessage.replaceAll("\\{numSentMails\\}", String.valueOf(messageJob.getNumberOfMessageTasks()));
    activity.setActivityMessage(activityMessage);
    activity.setActivityHeadline(mapHeadline(messageJob));
    
    activity.setRelatedEntityId(messageJob.getId());
    activity.setRelatedEntityType(RelatedEntityType.MESSAGE_JOB);
    
    return activityRepository.save(activity);
  }

  @Transactional
  public Optional<Activity> createActivityForMessageJobSendingFailed(MessageJob messageJob) {

    String activityMessage = getMessageJobSendingFailedMessage(messageJob);
    if (activityMessage == null) {
    	return Optional.empty();
    }
  	
    ActivityType activityType = ActivityType.MESSAGE_JOB_SENDING_FAILED;
    String originator = messageJob.getRunningDinner().getEmail();
    Activity activity = new Activity(LocalDateTime.now(), activityType, originator, messageJob.getRunningDinner());

    activity.setActivityMessage(activityMessage);
    activity.setActivityHeadline("Nicht alle Emails konnten zugestellt werden");

    activity.setRelatedEntityId(messageJob.getId());
    activity.setRelatedEntityType(RelatedEntityType.MESSAGE_JOB);

    return Optional.of(activityRepository.save(activity));
  }

  @Transactional
  public Activity createActivityForTeamsHostChangedByAdmin(List<Team> teams, RunningDinner runningDinner) {

    Activity result = new Activity(LocalDateTime.now(), ActivityType.CUSTOM_ADMIN_CHANGE, runningDinner.getEmail(), runningDinner);
    return createActivityForTeamsHostChanged(teams, result);
  }

  @Transactional
  public Activity createActivityForTeamsHostChangedByParticipant(List<Team> teams, RunningDinner runningDinner, Participant executingParticipant) {

    Activity result = new Activity(LocalDateTime.now(), ActivityType.PARTICIPANT_CHANGED_TEAMHOST, executingParticipant.getEmail(), runningDinner);
    result.setRelatedEntityId(executingParticipant.getId());
    result.setRelatedEntityType(RelatedEntityType.PARTICIPANT);
    return createActivityForTeamsHostChanged(teams, result);
  }
  
  @Transactional
  public Activity createActivityForCancelledRunningDinner(RunningDinner runningDinner) {

    LocalDateTime activityDate = LocalDateTime.now();

    Activity result = new Activity(activityDate, ActivityType.DINNER_CANCELLED, runningDinner.getEmail(), runningDinner);
    result.setActivityHeadline("Running Dinner abgesagt");
    result.setActivityMessage(RUNNING_DINNER_CANCELLED_MESSAGE_TEMPLATE);
   
    return activityRepository.save(result);
  }
  
  public Activity createActivityForRunningDinnerSettingsUpdated(RunningDinnerSettingsUpdatedEvent runningDinnerSettingsUpdatedEvent) {

    LocalDateTime activityDate = LocalDateTime.now();

    RunningDinner runningDinner = runningDinnerSettingsUpdatedEvent.getRunningDinner();
    Activity result = new Activity(activityDate, ActivityType.CUSTOM_ADMIN_CHANGE, runningDinner.getEmail(), runningDinner);

    if (runningDinnerSettingsUpdatedEvent.isBasicSettingsUpdate()) {
      result.setActivityHeadline("Running Dinner Basis Einstellungen geändert");
      result.setActivityMessage(RUNNING_DINNER_BASIC_SETTINGS_EDITED_TEMPLATE);
    } else if (runningDinnerSettingsUpdatedEvent.isRegistrationActiveStatusUpdate()) {
      if ( runningDinner.getPublicSettings().isRegistrationDeactivated()) {
        result.setActivityHeadline("Registrierung deaktiviert");
        result.setActivityMessage(RUNNING_DINNER_REGISTRATION_DEACTIVATED);
      } else {
        result.setActivityHeadline("Registrierung aktiviert");
        result.setActivityMessage(RUNNING_DINNER_REGISTRATION_ACTIVATED);
      }
    } else if (runningDinnerSettingsUpdatedEvent.isPublicSettingsUpdate()) {
      result.setActivityHeadline("Running Dinner Öffentliche Einstellungen geändert");
      result.setActivityMessage(RUNNING_DINNER_PUBLIC_SETTINGS_EDITED_TEMPLATE);
    } else {
      throw new IllegalStateException("Cannot handle RunningDinnerSettingsUpdatedEvent for " + runningDinner);
    }
   
    return activityRepository.save(result);
  }
  
  private Activity createActivityForTeamsHostChanged(List<Team> teams, Activity result) {

    // Works only for one team!
    for (Team team : teams) {
      Participant hostTeamMember = team.getHostTeamMember();
      String template = result.getActivityType() == ActivityType.PARTICIPANT_CHANGED_TEAMHOST
        ? TEAMS_HOST_CHANGED_BY_PARTICIPANT_DINNER_MESSAGE_TEMPLATE : TEAMS_HOST_CHANGED_DINNER_MESSAGE_TEMPLATE;
      String activityMessage = replaceTeamNumber(template, team);
      activityMessage = replaceParticipantName(activityMessage, hostTeamMember.getName().getFullnameFirstnameFirst());
      activityMessage = activityMessage.replaceAll("\\{originator\\}", result.getOriginator());
      result.setActivityMessage(activityMessage);
      result.setActivityHeadline(TEAM_HOST_CHANGED_BY_ADMIN_HEADLINE);
      if (result.getActivityType() == ActivityType.PARTICIPANT_CHANGED_TEAMHOST) {
        result.setActivityHeadline("Gastgeber durch Teilnehmer geändert");
      }
    }

    result = activityRepository.save(result);
    return result;
  }
  
  public List<Activity> findActivitiesByTypes(@ValidateAdminId String adminId, ActivityType ... activityTypes) {

    return activityRepository.findAllByActivityTypeInAndAdminIdOrderByActivityDateDesc(Arrays.asList(activityTypes), adminId);
  }
    
  public Checklist generateChecklist(List<Activity> activities, LocalDate now, RunningDinner runningDinner) {

    // Dinner created -> always check
    // Check participant mails sent
    // Check teams generated
    // =====> Optional: Edit teams
    // Check team arrangement mail sent
    // Check order... if team arrangement is before teams generated then admin has re-generated teams and must again sent mails
    // Check dinner routes sent

    Checklist checkList = new Checklist();

    for (Activity activity : activities) {
      if (activity.getActivityType() == ActivityType.PARTICIPANT_MAIL_SENT) {
        checkList.setParticipantMessagesSent(true);
      }
      else if (activity.getActivityType() == ActivityType.TEAM_ARRANGEMENT_CREATED) {
        checkList.setTeamArrangementsCreated(true);
      }
      else if (activity.getActivityType() == ActivityType.TEAMARRANGEMENT_MAIL_SENT) {
        checkList.setTeamMessagesSent(true);
      }
      else if (activity.getActivityType() == ActivityType.DINNERROUTE_MAIL_SENT) {
        checkList.setDinnerRouteMessagesSent(true);
      }
    }

    if (runningDinner.getRegistrationType() != RegistrationType.CLOSED) {
      LocalDate endOfRegistrationDate = runningDinner.getPublicSettings().getEndOfRegistrationDate();
      if (now.isAfter(endOfRegistrationDate)) {
        checkList.setEndOfRegistrationDate(true);
      }
    }

    return checkList;
  }

  public List<Activity> findActivityStream(RunningDinner runningDinner) {

    return activityRepository.findAllByAdminIdOrderByActivityDateAsc(runningDinner.getAdminId());
  }

  public List<Activity> findAdministrationActivityStream(RunningDinner runningDinner) {

    return activityRepository.findAllByActivityTypeInAndAdminIdOrderByActivityDateDesc(ADMIN_ACTIVITY_TYPES, runningDinner.getAdminId());
  }

  public Slice<Activity> findParticipantActionsActivityStream(RunningDinner runningDinner, int page) {

    Sort orderBy = Sort.by("activityDate").descending();

    Slice<Activity> result = activityRepository.findSliceByActivityTypeInAndAdminId(
      PARTICIPANT_ACTIVITY_TYPES, runningDinner.getAdminId(), PageRequest.of(page, PARTICIPANT_ACTIVITES_PAGE_SIZE, orderBy));
    return result;
  }
  
  public static boolean containsActivityType(List<Activity> activities, ActivityType activityType) {
  	
  	return activities
  					.stream()
  					.anyMatch(a -> a.getActivityType() == activityType);
  }
  
  protected static String replaceParticipantName(String template, String participantName) {
    
    return template.replaceAll("\\{participantName\\}",  participantName);
  }
  
  private String replaceTeamNumber(String template, Team team) {

    return template.replaceAll("\\{teamNumber\\}",  String.valueOf(team.getTeamNumber()));
  }
  
  protected List<String> getTeamNumbers(List<Team> teams) {

    List<String> result = teams.stream().map(t -> String.valueOf(t.getTeamNumber())).collect(Collectors.toList());
    return result;
  }
  
  protected static ActivityType mapActivityType(MessageJob messageJob) {

    if (messageJob.getMessageType() == MessageType.TEAM) {
      return ActivityType.TEAMARRANGEMENT_MAIL_SENT;
    }
    else if (messageJob.getMessageType() == MessageType.DINNER_ROUTE) {
      return ActivityType.DINNERROUTE_MAIL_SENT;
    }
    else if (messageJob.getMessageType() == MessageType.PARTICIPANT) {
      return ActivityType.PARTICIPANT_MAIL_SENT;
    }
    throw new IllegalArgumentException("Cannot map messageJob type " + messageJob);
  }
  
  protected static String mapMessageTemplate(MessageJob messageJob) {
    
    if (messageJob.getMessageType() == MessageType.TEAM) {
      return TEAM_ARRANGEMENT_MAIL_SENT_MESSAGE_TEMPLATE;
    }
    else if (messageJob.getMessageType() == MessageType.DINNER_ROUTE) {
      return DINNER_ROUTE_MAIL_SENT_MESSAGE_TEMPLATE;
    }
    else if (messageJob.getMessageType() == MessageType.PARTICIPANT) {
      return PARTICIPANT_MAIL_SENT_MESSAGE_TEMPLATE;
    }
    throw new IllegalArgumentException("Cannot map messageJob type " + messageJob);
  }

  protected static String mapHeadline(MessageJob messageJob) {
    
    if (messageJob.getMessageType() == MessageType.TEAM) {
      return "Teameinteilungen versandt";
    }
    else if (messageJob.getMessageType() == MessageType.DINNER_ROUTE) {
      return "Dinner-Routen versandt";
    }
    else if (messageJob.getMessageType() == MessageType.PARTICIPANT) {
      return "Emails an Teilnehmer versandt";
    }
    throw new IllegalArgumentException("Cannot map messageJob type " + messageJob);
  }

  private String getMessageJobSendingFailedMessage(MessageJob messageJob) {

    if (messageJob.getMessageType() == MessageType.TEAM) {
      return "Beim Email-Versand von Team-Nachrichten konnte mindestens eine Email nicht zugestellt werden.";
    }
    else if (messageJob.getMessageType() == MessageType.DINNER_ROUTE) {
      return "Beim Email-Versand der Dinner-Routen konnte mindestens eine Email nicht zugestellt werden.";
    }
    else if (messageJob.getMessageType() == MessageType.PARTICIPANT) {
      return "Beim Versand der Emails an die Teilnehmer konnte mindestens eine Email nicht zugestellt werden.";
    }
    LOGGER.warn("Currently we support only TEAM, DINNER_ROUTE and PARTICIPANT MessageJob Types for generating Activity Entities. Passed MessageJob was {}", messageJob);
    return null;
  }

  private static String getActivityMessageForWaitingListParticipantsAssigned(String template, AffectedTeamsInfo affectedTeamsInfo) {
  	if (affectedTeamsInfo.getNumTeams() == 1) {
    	return template.replaceAll("\\{numTeams\\}", affectedTeamsInfo.getNumTeamsStr() + " Team");
  	} else {
    	return template.replaceAll("\\{numTeams\\}", affectedTeamsInfo.getNumTeamsStr() + " Teams");
  	}
  }

  private static String getActivityMessageForWaitingListTeamsGenerated(String template, int numTeams) {
  	if (numTeams == 1) {
    	return template.replaceAll("\\{numTeams\\}", numTeams + " neues Team");
  	} else {
    	return template.replaceAll("\\{numTeams\\}", numTeams + " neue Teams");
  	}
  }
  
  static final class AffectedTeamsInfo {
  	
  	private int numTeams = 0;
  	private LocalDateTime activityDate = LocalDateTime.now();
  	
		public AffectedTeamsInfo(int numTeams, LocalDateTime activityDate) {
			this.numTeams = numTeams;
			this.activityDate = activityDate;
		}

		public AffectedTeamsInfo(List<Team> teams) {
	    if (CoreUtil.isNotEmpty(teams)) {
	      numTeams = teams.size();
	      Team lastCreatedTeam = teams.get(numTeams - 1);
	      activityDate = lastCreatedTeam.getModifiedAt();
	    }
		}

		public int getNumTeams() {
			return numTeams;
		}

		public String getNumTeamsStr() {
			return String.valueOf(numTeams);
		}
		
		public LocalDateTime getActivityDate() {
			return activityDate;
		}
  }
  
}
