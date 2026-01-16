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
import org.springframework.stereotype.Service;

@Service
public class ProposalExampleService {

  private static final Logger LOGGER = LoggerFactory.getLogger(ProposalExampleService.class);

  private final ProposalRepository proposalRepository;

  public ProposalExampleService(final ProposalRepository proposalRepository) {
    this.proposalRepository = proposalRepository;
  }

  public void saveMessageProposalExample(MessageProposalExampleEvent messageProposalExampleEvent) {

    final MessageJob messageJob = messageProposalExampleEvent.messageJob();
    final RunningDinner runningDinner = messageJob.getRunningDinner();

		if (!isRunningDinnerRelevant(runningDinner)) {
			return;
		}
    if (!isMessageJobRelevant(messageJob, messageProposalExampleEvent.messageTemplate())) {
      LOGGER.info("Skipping message proposal generation for non-relevant message job: {}", messageJob);
      return;
    }

    final ProposalExample messageProposal = ProposalExampleGenerator.newMessageProposalExample(messageProposalExampleEvent.messageTemplate(), runningDinner);
    if (messageProposal != null) {
      saveProposalIfNotExistingWithEqualContent(messageProposal);
    }
  }

	public void saveEventDescriptionProposalExample(RunningDinner runningDinner) {
		if (!isRunningDinnerRelevant(runningDinner)) {
			return;
		}
		final ProposalExample eventDescriptionProposal = ProposalExampleGenerator.newEventDescriptionProposalExample(runningDinner);
		saveProposalIfNotExistingWithEqualContent(eventDescriptionProposal);
	}

	private boolean isRunningDinnerRelevant(RunningDinner runningDinner) {
		if (runningDinner.getRegistrationType() == RegistrationType.CLOSED ||
				runningDinner.getRunningDinnerType() == RunningDinner.RunningDinnerType.DEMO) {
			LOGGER.info("Skipping proposal example generation for running dinner with registration type CLOSED or DEMO: {}", runningDinner);
			return false;
		}
		return true;
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

  private void saveProposalIfNotExistingWithEqualContent(ProposalExample proposal) {
    ProposalExample existingProposal = this.proposalRepository.findProposalByStoragePath(proposal.storagePath())
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
