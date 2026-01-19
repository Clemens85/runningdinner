
package org.runningdinner.event.listener;

import org.runningdinner.admin.AfterPartyLocationService;
import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.proposal.ProposalExampleService;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.event.NewRunningDinnerEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Component
public class NewRunningDinnerListener implements ApplicationListener<NewRunningDinnerEvent> {

  private static final Logger LOGGER = LoggerFactory.getLogger(NewRunningDinnerListener.class);

  private final MessageService messageService;

  private final AfterPartyLocationService afterParLocationService;

	private final ProposalExampleService proposalExampleService;
  
  public NewRunningDinnerListener(MessageService messageService, AfterPartyLocationService afterParLocationService, ProposalExampleService proposalExampleService) {
    this.messageService = messageService;
    this.afterParLocationService = afterParLocationService;
		this.proposalExampleService = proposalExampleService;
	}

  @Override
  public void onApplicationEvent(NewRunningDinnerEvent event) {

    RunningDinner newRunningDinner = event.getNewRunningDinner();
    
    LOGGER.info("Created {} for email {}", newRunningDinner.getAdminId(), newRunningDinner.getEmail());
   
    messageService.sendRunningDinnerCreatedMessage(newRunningDinner);

		try {
			afterParLocationService.putGeocodeEventToQueue(newRunningDinner);
		} catch (Exception e) {
			LOGGER.error("Geocoding after party location failed for running dinner {}", newRunningDinner.getAdminId(), e);
		}

		try {
			proposalExampleService.saveEventDescriptionProposalExample(newRunningDinner);
		} catch (Exception e) {
			LOGGER.error("Saving event description proposal example failed for running dinner {}", newRunningDinner.getAdminId(), e);
		}
  }
}
