package org.runningdinner.admin.message.proposal;

import org.runningdinner.admin.message.BaseMessage;
import org.runningdinner.admin.message.job.MessageJob;
import org.runningdinner.admin.message.job.MessageType;
import org.runningdinner.admin.message.participant.ParticipantMessage;
import org.runningdinner.admin.message.participant.ParticipantSelection;
import org.runningdinner.admin.message.team.BaseTeamMessage;
import org.runningdinner.admin.message.team.TeamSelection;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
public class MessageProposalEventHandlerService {

  private static final Logger LOGGER = LoggerFactory.getLogger(MessageProposalEventHandlerService.class);

  private final ProposalRepository proposalRepository;

  public MessageProposalEventHandlerService(final ProposalRepository proposalRepository) {
    this.proposalRepository = proposalRepository;
  }

  @EventListener
  public void handleMessageProposal(MessageProposalEvent messageProposalEvent) {

    final MessageJob messageJob = messageProposalEvent.messageJob();
    final RunningDinner runningDinner = messageJob.getRunningDinner();

    if (runningDinner.getRegistrationType() == RegistrationType.CLOSED ||
        runningDinner.getRunningDinnerType() == RunningDinner.RunningDinnerType.DEMO) {
      LOGGER.info("Skipping message proposal generation for running dinner with registration type CLOSED or DEMO: {}", runningDinner);
      return;
    }

    if (!isMessageJobRelevant(messageJob, messageProposalEvent.messageTemplate())) {
      LOGGER.info("Skipping message proposal generation for non-relevant message job: {}", messageJob);
      return;
    }

    final ProposalBase eventDescriptionProposal = ProposalBaseGenerator.newEventDescriptionProposal(runningDinner);
    saveProposalIfNotExistingWithEqualContent(eventDescriptionProposal);

    final ProposalBase messageProposal = ProposalBaseGenerator.newMessageProposal(messageProposalEvent.messageTemplate(), runningDinner);
    if (messageProposal != null) {
      saveProposalIfNotExistingWithEqualContent(messageProposal);
    }
  }

  private boolean isMessageJobRelevant(MessageJob messageJob, BaseMessage messageTemplate) {
    final MessageType messageType = messageJob.getMessageType();
    if (messageType != MessageType.PARTICIPANT && messageType != MessageType.TEAM && messageType != MessageType.DINNER_ROUTE) {
      return false;
    }
    return switch (messageTemplate) {
      case BaseTeamMessage baseTeamMessage -> baseTeamMessage.getTeamSelection() == TeamSelection.ALL;
      case ParticipantMessage participantMessage ->
          participantMessage.getParticipantSelection() == ParticipantSelection.ALL;
      case null, default -> false;
    };
  }

  private void saveProposalIfNotExistingWithEqualContent(ProposalBase proposal) {
    ProposalBase existingProposal = this.proposalRepository.findProposalByStoragePath(proposal.storagePath())
                                              .orElse(null);
    if (existingProposal == null) {
      this.proposalRepository.saveProposal(proposal);
      return;
    }
    if (proposal.equals(existingProposal)) {
      LOGGER.info("Skipping saving proposal since an existing one with equal content is already present: {}", proposal);
      return;
    }
    this.proposalRepository.saveProposal(proposal);
  }
}
