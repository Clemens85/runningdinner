package org.runningdinner.admin.message;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.persistence.EntityNotFoundException;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.MailConfig;
import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.activity.ActivityService;
import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.admin.message.dinner.RunningDinnerRelatedMessage;
import org.runningdinner.admin.message.dinnerroute.DinnerRouteMessage;
import org.runningdinner.admin.message.job.Message;
import org.runningdinner.admin.message.job.MessageJob;
import org.runningdinner.admin.message.job.MessageJobOverview;
import org.runningdinner.admin.message.job.MessageJobRepository;
import org.runningdinner.admin.message.job.MessageTask;
import org.runningdinner.admin.message.job.MessageTaskRepository;
import org.runningdinner.admin.message.job.MessageType;
import org.runningdinner.admin.message.job.SendingResult;
import org.runningdinner.admin.message.job.SendingStatus;
import org.runningdinner.admin.message.participant.ParticipantMessage;
import org.runningdinner.admin.message.participant.ParticipantSelection;
import org.runningdinner.admin.message.processor.MessageJobProcessorHelperService;
import org.runningdinner.admin.message.team.BaseTeamMessage;
import org.runningdinner.admin.message.team.TeamMessage;
import org.runningdinner.admin.message.team.TeamSelection;
import org.runningdinner.common.Issue;
import org.runningdinner.common.IssueKeys;
import org.runningdinner.common.IssueList;
import org.runningdinner.common.IssueType;
import org.runningdinner.common.exception.DinnerNotAcknowledgedException;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.core.FuzzyBoolean;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinner.RunningDinnerType;
import org.runningdinner.core.dinnerplan.TeamRouteBuilder;
import org.runningdinner.mail.MailService;
import org.runningdinner.mail.formatter.DinnerRouteMessageFormatter;
import org.runningdinner.mail.formatter.ParticipantMessageFormatter;
import org.runningdinner.mail.formatter.TeamArrangementMessageFormatter;
import org.runningdinner.mail.sendgrid.SuppressedEmail;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.Assert;

@Service
public class MessageService {
  
  private static final Logger LOGGER = LoggerFactory.getLogger(MessageService.class);

  @Autowired
  private MessageJobRepository messageJobRepository;
  
  @Autowired
  private MessageTaskRepository messageTaskRepository;
  
  @Autowired
  private RunningDinnerService runningDinnerService;
  
  @Autowired
  private ParticipantService participantService;
  
  @Autowired
  private TeamService teamService;
  
  @Autowired
  private ActivityService activityService;
  
  @Autowired
  private ParticipantMessageFormatter participantMessageFormatter;
  
  @Autowired
  private TeamArrangementMessageFormatter teamArrangementMessageFormatter;
 
  @Autowired
  private DinnerRouteMessageFormatter dinnerRouteMessageFormatter;
  
  @Autowired
  private MessageJobProcessorHelperService messageJobProcessorHelperService;
  
  @Autowired
  private MailConfig mailConfig;
  
  @Autowired
  private MailService mailService;
  
  @Transactional
  public MessageJob createParticipantMessagesJob(@ValidateAdminId String adminId, ParticipantMessage participantMessage) {
    
    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    
    List<Participant> participants = getParticipants(adminId, participantMessage);
    
    MessageJob messageJob = new MessageJob(MessageType.PARTICIPANT, runningDinner);
    final MessageJob result = messageJobRepository.save(messageJob);

    List<MessageTask> messageTasks = newParticipantMessageTasks(runningDinner, participants, participantMessage, messageJob);
    
    return saveMessageJobAndCreateActivity(result, messageTasks);
  }
  
  private List<MessageTask> newParticipantMessageTasks(RunningDinner runningDinner, 
                                                       List<Participant> participants, 
                                                       ParticipantMessage participantMessage, 
                                                       MessageJob parentMessageJob) {

    final String replyTo = runningDinner.getEmail();
    
    return participants
      .stream()
      .filter(p -> StringUtils.isNotEmpty(p.getEmail()))
      .map(p -> {
        MessageTask messageTask = new MessageTask(parentMessageJob, runningDinner);
        String text = participantMessageFormatter.formatParticipantMessage(p, participantMessage);
        messageTask.setMessage(new Message(participantMessage.getSubject(), text, replyTo));
        messageTask.setRecipientEmail(getRecipientEmail(p));
        return messageTask;
      })
      .collect(Collectors.toList());
  }

  public List<PreviewMessage> getParticipantMailPreview(@ValidateAdminId String adminId, ParticipantMessage participantMessage) {

    // Can of course be optimized to not load too much participants...:
    List<Participant> participants = getParticipants(adminId, participantMessage);
    Participant participant = participants.get(0);
    Assert.state(participants.size() == 1, "Expected exactly one participant for preview but found " + participants.size());
    String message = participantMessageFormatter.formatParticipantMessage(participant, participantMessage);
    return Collections.singletonList(new PreviewMessage(participant.getId(), message));
  }
  
  @Transactional
  public MessageJob sendParticipantMessages(@ValidateAdminId String adminId, ParticipantMessage participantMessage) {
    
    final MessageJob messageJob = createParticipantMessagesJob(adminId, participantMessage);
    executeSendMessagesJobAfterCommit(messageJob);
    return messageJob;
  }
  
  public MessageJob sendParticipantMessagesSelf(@ValidateAdminId String adminId, ParticipantMessage participantMessage) {
    
    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    
    MessageJob parentMessageJob = new MessageJob(MessageType.PARTICIPANT, runningDinner);
    
    List<Participant> participants = getParticipants(adminId, participantMessage);
    Assert.state(participants.size() == 1, "Expected exactly one participant for sending mail to dinner owner but found " + participants.size());
    
    List<MessageTask> messageTasks = newParticipantMessageTasks(runningDinner, participants, participantMessage, parentMessageJob);
    sendMessageTasksSelf(messageTasks, runningDinner);

    return parentMessageJob;
  }
  
  public List<PreviewMessage> getTeamPreview(@ValidateAdminId String adminId, TeamMessage teamMessage) {

    // Can of course be optimized to not load too much participants...:
    List<Team> teams = getTeams(adminId, teamMessage);
    final Team team = teams.get(0);
    Assert.state(teams.size() == 1, "Expected exactly one team for preview but found " + teams.size());
    
    final RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
   
    return team.getTeamMembers()
                  .stream()
                  .map(teamMember -> teamArrangementMessageFormatter.formatTeamMemberMessage(runningDinner, teamMember, team, teamMessage))
                  .map(message -> new PreviewMessage(team.getId(), message))
                  .collect(Collectors.toList());
  }
  
  @Transactional
  public MessageJob sendTeamMessages(@ValidateAdminId String adminId, TeamMessage teamMessage) {
    
    final MessageJob messageJob = createTeamArrangementMessagesJob(adminId, teamMessage);
    executeSendMessagesJobAfterCommit(messageJob);
    return messageJob;
  }
  
  public MessageJob sendTeamMessagesSelf(@ValidateAdminId String adminId, TeamMessage teamMessage) {
    
    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    
    MessageJob parentMessageJob = new MessageJob(MessageType.TEAM, runningDinner);
    
    List<Team> teams = getTeams(adminId, teamMessage);
    Assert.state(teams.size() == 1, "Expected exactly one team for sending mail to dinner owner but found " + teams.size());
    
    List<MessageTask> messageTasks = newTeamMessageTasks(runningDinner, teams, teamMessage, parentMessageJob);
    sendMessageTasksSelf(messageTasks, runningDinner);

    return parentMessageJob;
  }
  
  @Transactional(readOnly = true)
  public List<PreviewMessage> getDinnerRoutePreview(@ValidateAdminId String adminId, DinnerRouteMessage dinnerRouteMessage) {

    // Can of course be optimized to not load too much participants...:
    List<Team> teams = getTeams(adminId, dinnerRouteMessage);
    final Team team = teams.get(0);
    Assert.state(teams.size() == 1, "Expected exactly one team for preview but found " + teams.size());
    
    final List<Team> dinnerRoute = TeamRouteBuilder.generateDinnerRoute(team);
    
    final RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    
    List<PreviewMessage> result = team.getTeamMembers()
                                        .stream()
                                        .map(teamMember -> dinnerRouteMessageFormatter.formatDinnerRouteMessage(runningDinner, teamMember, team, dinnerRoute, dinnerRouteMessage))
                                        .map(message -> new PreviewMessage(team.getId(), message))
                                        .collect(Collectors.toList());
    return result;
  }

  
  @Transactional
  public MessageJob sendDinnerRouteMessages(@ValidateAdminId String adminId, DinnerRouteMessage dinnerRouteMessage) {
    
    final MessageJob messageJob = createDinnerRouteMessagesJob(adminId, dinnerRouteMessage);
    executeSendMessagesJobAfterCommit(messageJob);
    return messageJob;
  }
  
  public MessageJob sendDinnerRouteMessagesSelf(@ValidateAdminId String adminId, DinnerRouteMessage dinnerRouteMessage) {
    
    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    
    MessageJob parentMessageJob = new MessageJob(MessageType.DINNER_ROUTE, runningDinner);
    
    List<Team> teams = getTeams(adminId, dinnerRouteMessage);
    Assert.state(teams.size() == 1, "Expected exactly one team for sending mail to dinner owner but found " + teams.size());
    
    List<MessageTask> messageTasks = newDinnerRouteMessageTasks(runningDinner, teams, dinnerRouteMessage, parentMessageJob);
    sendMessageTasksSelf(messageTasks, runningDinner);

    return parentMessageJob;
  }
  
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public MessageJob sendNewRunningDinnerMessage(RunningDinnerRelatedMessage newRunningDinnerMessage) {
    
    final MessageJob messageJob = createNewRunningDinnerMessageJob(newRunningDinnerMessage);
    executeSendMessagesJobAfterCommit(messageJob);
    return messageJob;
  }

  private MessageJob createNewRunningDinnerMessageJob(RunningDinnerRelatedMessage newRunningDinnerMessage) {
       
    MessageJob messageJob = new MessageJob(MessageType.NEW_RUNNING_DINNER, newRunningDinnerMessage.getRunningDinner());
    MessageJob result = messageJobRepository.save(messageJob);

    MessageTask messageTask = new MessageTask(result, newRunningDinnerMessage.getRunningDinner());
    messageTask.setMessage(new Message(newRunningDinnerMessage.getSubject(), newRunningDinnerMessage.getMessage(), mailConfig.getDefaultFrom()));
    messageTask.setRecipientEmail(newRunningDinnerMessage.getRunningDinner().getEmail());
      
    return saveMessageJob(result, Collections.singletonList(messageTask));
  }
  
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public MessageJob sendSubscriptionActivationMail(RunningDinnerRelatedMessage message, Participant subscribedParticipant) {
    
    final MessageJob messageJob = createSubscriptionActivationMessageJob(message, subscribedParticipant);
    executeSendMessagesJobAfterCommit(messageJob);
    return messageJob;
  }

  private MessageJob createSubscriptionActivationMessageJob(RunningDinnerRelatedMessage message, 
                                                            Participant subscribedParticipant) {
       
    RunningDinner runningDinner = message.getRunningDinner();
    
    MessageJob messageJob = new MessageJob(MessageType.PARTICIPANT_SUBSCRIPTION_ACTIVATION, runningDinner);
    MessageJob result = messageJobRepository.save(messageJob);

    MessageTask messageTask = new MessageTask(result, runningDinner);
    messageTask.setMessage(new Message(message.getSubject(), message.getMessage(), mailConfig.getDefaultFrom()));
    messageTask.setRecipientEmail(subscribedParticipant.getEmail());
      
    return saveMessageJob(result, Collections.singletonList(messageTask));
  }
  
  
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public MessageJob sendTeamPartnerWishMail(RunningDinnerRelatedMessage message, String recipientEmail, String fromEmail) {
    
    final MessageJob messageJob = createTeamPartnerWishMessageJob(message, recipientEmail, fromEmail);
    executeSendMessagesJobAfterCommit(messageJob);
    return messageJob;
  }

  private MessageJob createTeamPartnerWishMessageJob(RunningDinnerRelatedMessage message, String recipientEmail, String fromEmail) {
       
    RunningDinner runningDinner = message.getRunningDinner();
    
    MessageJob messageJob = new MessageJob(MessageType.TEAM_PARTNER_WISH, runningDinner);
    MessageJob result = messageJobRepository.save(messageJob);

    MessageTask messageTask = new MessageTask(result, runningDinner);
    messageTask.setMessage(new Message(message.getSubject(), message.getMessage(), fromEmail));
    messageTask.setRecipientEmail(recipientEmail);
    
    changeRecipientsToDinnerAdminForDemoMode(messageJob, Collections.singletonList(messageTask));
    
    return saveMessageJob(result, Collections.singletonList(messageTask));
  }
  
  @Transactional
  public MessageJob sendTeamHostChangedMessages(@ValidateAdminId String adminId, Team team, Participant executingParticipant, String comment) {
    
    final MessageJob messageJob = createTeamHostChangedMessagesJob(adminId, team, executingParticipant, comment);
    executeSendMessagesJobAfterCommit(messageJob);
    return messageJob;
  }

  private MessageJob createTeamHostChangedMessagesJob(String adminId, Team team, Participant executingParticipant, String comment) {

    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);

    MessageJob messageJob = new MessageJob(MessageType.TEAM_HOST_CHANGED_BY_PARTICIPANT, runningDinner);
    MessageJob result = messageJobRepository.save(messageJob);

    final String replyTo = executingParticipant.getEmail();

    List<MessageTask> messageTasks = new ArrayList<>();
    for (Participant teamMember : team.getTeamMembers()) {

      if (StringUtils.isEmpty(teamMember.getEmail()) || teamMember.equals(executingParticipant)) {
        continue;
      }
      // TODO: Das sollte ausserhalb dieses Services liegen!!!
      
      MessageTask messageTask = new MessageTask(result, runningDinner);
      String content = "Persönliche Nachricht: " + comment;
      messageTask.setMessage(new Message("Gastgeber geändert", content, replyTo)); // TODO: Subjekt + Template für Body
      messageTask.setRecipientEmail(getRecipientEmail(teamMember));
      messageTasks.add(messageTask);
    }

    return saveMessageJob(result, messageTasks); // Activity is created in other place
  }

  public List<MessageJob> findMessageJobs(String adminId, MessageType messageType) {
    
    if (messageType != null) {
      return messageJobRepository.findByAdminIdAndMessageType(adminId, messageType);
    } else {
      return messageJobRepository.findByAdminId(adminId);
    }
  }
  
  public List<MessageTask> findMessageTasks(String adminId, UUID messageJobId) {

    return messageTaskRepository.findByAdminIdAndParentJobIdOrderBySendingStartTimeDescCreatedAtDesc(adminId, messageJobId);
  }
  
  public MessageJob findMessageJob(@ValidateAdminId String adminId, UUID messageJobId) {

    return messageJobRepository.findByAdminIdAndId(adminId, messageJobId);
  }

  public Optional<MessageTask> findMessageTaskBySenderAndRecipient(@ValidateAdminId String adminId, 
                                                                   String senderEmail, 
                                                                   String recipientEmail, 
                                                                   MessageType messageType) {

    MessageTask result = messageTaskRepository.findByMessageReplyToAndRecipientEmailAndParentJobMessageTypeAndAdminId(senderEmail, recipientEmail, messageType, adminId);
    return Optional.ofNullable(result);
  }
  
  public List<MessageTask> findNonFailedEndUserMessageTasksByRecipientsStartingFrom(Collection<String> recipientEmails, LocalDateTime fromTime) {
    
    List<MessageType> parentJobMessageTypes = getEndUserMessageTypes();
    Set<String> lowerCasedRecipientEmails = recipientEmails
                                              .stream()
                                              .map(recipientEmail -> StringUtils.lowerCase(recipientEmail))
                                              .filter(Objects::nonNull)
                                              .collect(Collectors.toSet());
    
    if (CollectionUtils.isEmpty(lowerCasedRecipientEmails)) {
      return new ArrayList<>();
    }
    return messageTaskRepository.findNonFailedByRecipientsAndParentJobTypeStartingFrom(lowerCasedRecipientEmails, fromTime, parentJobMessageTypes);
  }
  
  public Optional<MessageJob> findLatestEndUserMessageJob() {

    MessageJob result = messageJobRepository.findFirstByMessageTypeInOrderByCreatedAtDesc(getEndUserMessageTypes());
    return Optional.ofNullable(result);
  }
  
  // TODO: Test
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public MessageTask updateMessageTaskAsFailedInNewTransaction(UUID messageTaskId, SuppressedEmail suppressedEmail) {

    MessageTask messageTask = messageTaskRepository.findByIdMandatory(messageTaskId);
    
    messageTask.setSendingResult(new SendingResult());
    messageTask.getSendingResult().setDelieveryFailed(true);
    messageTask.getSendingResult().setFailureMessage(suppressedEmail.getReason());
    messageTask.getSendingResult().setFailureType(suppressedEmail.getFailureType());
    messageTask.getSendingResult().setDelieveryFailedDate(suppressedEmail.getCreatedAsLocalDateTime());
    
    MessageTask result = messageTaskRepository.save(messageTask);
    
    MessageJob parentMessageJob = result.getParentJob();
    if (parentMessageJob.getSendingFailed() != FuzzyBoolean.TRUE) {
      LOGGER.info("Set sendingFailed to true for {} due to change in {}", parentMessageJob, result);
      parentMessageJob.setSendingFailed(FuzzyBoolean.TRUE);
      parentMessageJob = messageJobRepository.save(parentMessageJob);
      activityService.createActivityForMessageJobSendingFailed(parentMessageJob);
    }
    
    return result;
  }

  @Transactional
  public MessageTask reSendMessageTask(String adminId, UUID messageTaskId, MessageTask incomingMessageTask) {

    Assert.state(messageTaskId.equals(incomingMessageTask.getId()), "Expecting incoming id " + messageTaskId + " to be same as incoming object " + incomingMessageTask);
    Assert.notNull(adminId, "AdminId not passed!");
    
    MessageTask messageTask = messageTaskRepository.findByIdAndAdminId(messageTaskId, adminId);
    Assert.notNull(messageTask, "MessageTask with id " + messageTaskId + " and adminId " + adminId + " could not be found!");
    
    messageTask.setRecipientEmail(incomingMessageTask.getRecipientEmail());
    messageTask.getMessage().setContent(incomingMessageTask.getMessage().getContent());
    messageTask.getMessage().setSubject(incomingMessageTask.getMessage().getSubject());
    
    messageTask.setSendingStartTime(LocalDateTime.now());
    mailService.sendMessage(messageTask); // If exception occurs whole transaction will be rollbacked
    messageTask.setSendingEndTime(LocalDateTime.now());
    messageTask.setSendingStatus(SendingStatus.SENDING_FINISHED);
   
    messageTask.setSendingResult(new SendingResult());
    
    MessageTask result = messageTaskRepository.save(messageTask);
    
    MessageJob updatedMessageJob = markParentMessageJobSuccessfulIfAllMessageTasksSucceeded(messageTask.getParentJob());
    result.setParentJob(updatedMessageJob);
    
    return result;
  }
  
  @Transactional(propagation = Propagation.REQUIRES_NEW)
  public MessageJob markMessageJobSuccessfulIfAllMessageTasksSucceededInNewTransaction(UUID messageJobId) {

    MessageJob parentJob = messageJobRepository.findById(messageJobId)
            .orElseThrow(() -> new EntityNotFoundException("Could not find Message Job by id " + messageJobId));
    
    return markParentMessageJobSuccessfulIfAllMessageTasksSucceeded(parentJob);
  }
  
  public List<MessageTask> findQueuedMessageTasksLastModifiedBefore(LocalDateTime lastModifiedDateBefore) {

    List<MessageTask> result = messageTaskRepository.findBySendingStatusAndModifiedAtBeforeOrderByModifiedAtAscParentJobId(SendingStatus.QUEUED, lastModifiedDateBefore);
    return result;
  }
  
  public void resend
  
  private MessageJob markParentMessageJobSuccessfulIfAllMessageTasksSucceeded(MessageJob parentJob) {

    long numberOfRemainingFailedTasks = messageTaskRepository.countByAdminIdAndParentJobIdAndSendingResultDelieveryFailed(parentJob.getAdminId(), parentJob.getId(), true);
    if (numberOfRemainingFailedTasks < 1) {
      LOGGER.info("Marking {} as successfuly processed due to all messagetasks succeeded", parentJob);
      parentJob.setSendingFailed(FuzzyBoolean.FALSE);
      parentJob.setSendingStatus(SendingStatus.SENDING_FINISHED);
      return messageJobRepository.save(parentJob);
    }
    return parentJob;
  }
  

  public MessageJobOverview findMessageJobOverview(@ValidateAdminId String adminId, UUID messageJobId) {

    List<MessageTask> messageTasks = findMessageTasks(adminId, messageJobId);
    return MessageJobOverview.newMessageJobOverview(messageTasks);
  }
  
  private MessageJob createTeamArrangementMessagesJob(@ValidateAdminId String adminId, TeamMessage teamMessage) {

    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    
    List<Team> teams = getTeams(adminId, teamMessage);
    
    MessageJob messageJob = new MessageJob(MessageType.TEAM, runningDinner);
    final MessageJob result = messageJobRepository.save(messageJob);

    List<MessageTask> messageTasks = newTeamMessageTasks(runningDinner, teams, teamMessage, messageJob);
    return saveMessageJobAndCreateActivity(result, messageTasks);
  }
  
  private List<MessageTask> newTeamMessageTasks(RunningDinner runningDinner, List<Team> teams, TeamMessage teamMessage, MessageJob parentMessageJob) {
    
    final String replyTo = runningDinner.getEmail();
    
    List<MessageTask> result = new ArrayList<>();
    for (Team team : teams) {
      
      for (Participant teamMember : team.getTeamMembers()) {
        if (StringUtils.isEmpty(teamMember.getEmail())) {
          continue;
        }
        String text = teamArrangementMessageFormatter.formatTeamMemberMessage(runningDinner, teamMember, team, teamMessage);
        MessageTask messageTask = new MessageTask(parentMessageJob, runningDinner);
        messageTask.setMessage(new Message(teamMessage.getSubject(), text, replyTo));
        messageTask.setRecipientEmail(getRecipientEmail(teamMember));
        result.add(messageTask);
      }
    }
    return result;
  }
  
  private List<MessageTask> newDinnerRouteMessageTasks(RunningDinner runningDinner, List<Team> teams, DinnerRouteMessage dinnerRouteMessage, MessageJob parentMessageJob) {
    
    final String replyTo = runningDinner.getEmail();
    
    List<MessageTask> result = new ArrayList<>();
    for (Team team : teams) {
      
      for (Participant teamMember : team.getTeamMembers()) {
        if (StringUtils.isEmpty(teamMember.getEmail())) {
          continue;
        }
        
        List<Team> dinnerRoute = TeamRouteBuilder.generateDinnerRoute(team);
        
        String text = dinnerRouteMessageFormatter.formatDinnerRouteMessage(runningDinner, teamMember, team, dinnerRoute, dinnerRouteMessage);
        MessageTask messageTask = new MessageTask(parentMessageJob, runningDinner);
        messageTask.setMessage(new Message(dinnerRouteMessage.getSubject(), text, replyTo));
        messageTask.setRecipientEmail(getRecipientEmail(teamMember));
        result.add(messageTask);
      }
    }
    return result;
  }
  
  private MessageJob createDinnerRouteMessagesJob(@ValidateAdminId String adminId, DinnerRouteMessage dinnerRouteMessage) {

    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    
    List<Team> teams = getTeams(adminId, dinnerRouteMessage);
    
    MessageJob messageJob = new MessageJob(MessageType.DINNER_ROUTE, runningDinner);
    MessageJob result = messageJobRepository.save(messageJob);

    List<MessageTask> messageTasks = newDinnerRouteMessageTasks(runningDinner, teams, dinnerRouteMessage, messageJob);
    return saveMessageJobAndCreateActivity(result, messageTasks);
  }
  
  private static List<MessageType> getEndUserMessageTypes() {
    
    return Arrays.asList(MessageType.DINNER_ROUTE, MessageType.PARTICIPANT, MessageType.TEAM_HOST_CHANGED_BY_PARTICIPANT, MessageType.TEAM);
  }
  
  private MessageJob saveMessageJobAndCreateActivity(MessageJob messageJob, List<MessageTask> messageTasks) {
    
    Assert.state(messageJob.getMessageType().isSendingToDinnerAdminInDemoModeNeeded(), 
                 "Incoming MessageType " + messageJob.getMessageType() + " is not yet considered in logic for demo-mode");
    
    changeRecipientsToDinnerAdminForDemoMode(messageJob, messageTasks);
    
    MessageJob result = saveMessageJob(messageJob, messageTasks);
    activityService.createActivityForNewMessageJob(result);
    return result;
  }
  
  private void changeRecipientsToDinnerAdminForDemoMode(MessageJob messageJob, List<MessageTask> messageTasks) {

    if (messageJob.getRunningDinner().getRunningDinnerType() != RunningDinnerType.DEMO) {
      return;
    }
    for (MessageTask messageTask : messageTasks) {
      messageTask.setRecipientEmail(messageJob.getRunningDinner().getEmail());
    }
  }

  private MessageJob saveMessageJob(MessageJob messageJob, List<MessageTask> messageTasks) {
    
    messageTaskRepository.saveAll(messageTasks);
    
    messageJob.setNumberOfMessageTasks(messageTasks.size());
    messageJob = messageJobRepository.save(messageJob);
    
    return messageJob;
  }
  
  private String getRecipientEmail(Participant participant) {
    
    return participant.getEmail();
  }
  
  private List<Participant> getParticipants(String adminId, ParticipantMessage participantMessage) {

    List<Participant> result = new ArrayList<>();
    
    ParticipantSelection participantSelection = participantMessage.getParticipantSelection();
    if (participantSelection == ParticipantSelection.ALL) {
      result = participantService.findParticipants(adminId, true);
    } else if (participantSelection == ParticipantSelection.ASSIGNED_TO_TEAM) {
      result = participantService.findActiveParticipantsAssignedToTeam(adminId);
    } else if (participantSelection == ParticipantSelection.NOT_ASSIGNED_TO_TEAM) {
      result = participantService.findActiveParticipantsNotAssignedToTeam(adminId);
    } else if (participantSelection == ParticipantSelection.CUSTOM_SELECTION) {
      result = getCustomSelectedParticipants(adminId, participantMessage);
    }

    if (CollectionUtils.isEmpty(result)) {
      throw new ValidationException(new IssueList(new Issue(IssueKeys.INVALID_SIZE_SELECTED_PARTICIPANTS_MESSAGE_EMPTY, IssueType.VALIDATION)));
    }
    
    return result;
  }

  private List<Team> getTeams(String adminId, BaseTeamMessage baseTeamMessage) {

    List<Team> result = new ArrayList<>();
    
    TeamSelection teamSelection = baseTeamMessage.getTeamSelection();
    if (teamSelection == TeamSelection.ALL) {
      result = teamService.findTeamArrangements(adminId, true);
    } else if (teamSelection == TeamSelection.CUSTOM_SELECTION) {
      result = getCustomSelectedTeams(adminId, baseTeamMessage);
    }

    if (CollectionUtils.isEmpty(result)) {
      throw new ValidationException(new IssueList(new Issue(IssueKeys.INVALID_SIZE_SELECTED_PARTICIPANTS_MESSAGE_EMPTY, IssueType.VALIDATION)));
    }
    
    return result;
  }

  private List<Participant> getCustomSelectedParticipants(String adminId, ParticipantMessage participantMessage) {
    
    List<UUID> customSelectedParticipantIds = participantMessage.getCustomSelectedParticipantIds();
    Set<UUID> customSelectedParticipantIdsAsSet = new HashSet<>(customSelectedParticipantIds);
    
    if (CollectionUtils.isEmpty(customSelectedParticipantIds)) {
      throw new ValidationException(new IssueList(new Issue("No Participant Ids provided for custom selection", IssueType.VALIDATION)));
    }
    
    List<Participant> result = participantService.findParticipantsByIds(adminId, customSelectedParticipantIdsAsSet);
    Assert.state(result.size() == customSelectedParticipantIdsAsSet.size(), "Could not find all participants by id for " + customSelectedParticipantIdsAsSet + ". Found " + result);
    return result;
  }
  
  private List<Team> getCustomSelectedTeams(String adminId, BaseTeamMessage baseTeamMessage) {
    
    List<UUID> customSelectedTeamIds = baseTeamMessage.getCustomSelectedTeamIds();
    Set<UUID> customSelectedTeamIdsAsSet = new HashSet<>(customSelectedTeamIds);
    
    if (CollectionUtils.isEmpty(customSelectedTeamIds)) {
      throw new ValidationException(new IssueList(new Issue("No Team Ids provided for custom selection", IssueType.VALIDATION)));
    }
    
    List<Team> result = teamService.findTeamsWithMembersOrdered(adminId, customSelectedTeamIdsAsSet);
    Assert.state(result.size() == customSelectedTeamIdsAsSet.size(), "Could not find all teams by id for " + customSelectedTeamIdsAsSet + ". Found " + result);
    return result;
  }
  
  private void sendMessageTasksSelf(List<MessageTask> messageTasks, RunningDinner runningDinner) {

    Assert.state(CollectionUtils.isNotEmpty(messageTasks), "Need at least one messageTask when trying to send self-message in " + runningDinner);
    for (MessageTask messageTask : messageTasks) {
      messageTask.setRecipientEmail(runningDinner.getEmail());
      mailService.sendMessage(messageTask);
    }
  }
  
  private void executeSendMessagesJobAfterCommit(final MessageJob messageJob) {

    checkAcknowledgedDinner(messageJob);
    
    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {
      @Override
      
      public void afterCommit() {
        
        LOGGER.info("Publishing {}", messageJob);
        messageJobProcessorHelperService.publishProcessingEventAsync(messageJob);
      }
    });
  }

  private void checkAcknowledgedDinner(MessageJob messageJob) {
    
    if (!messageJob.getMessageType().isAcknowledgedDinnerNeeded()) {
      return;
    }
    RunningDinner runningDinner = messageJob.getRunningDinner();
    if (!runningDinner.isAcknowledged()) {
      throw new DinnerNotAcknowledgedException(messageJob);
    }
  }

}
