package org.runningdinner.admin.message.proposal;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class MessageProposalExampleEventHandlerService {

	private final ProposalExampleService proposalExampleService;

	public MessageProposalExampleEventHandlerService(ProposalExampleService proposalExampleService) {
		this.proposalExampleService = proposalExampleService;
	}
	@EventListener
	public void handleMessageProposalExample(MessageProposalExampleEvent messageProposalExampleEvent) {
		this.proposalExampleService.saveMessageProposalExample(messageProposalExampleEvent);
	}
}
