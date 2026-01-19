package org.runningdinner.event.listener;

import org.runningdinner.admin.AfterPartyLocationService;
import org.runningdinner.admin.message.proposal.ProposalExampleService;
import org.runningdinner.event.RunningDinnerSettingsUpdatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Component
public class RunningDinnerSettingsUpdatedListener implements ApplicationListener<RunningDinnerSettingsUpdatedEvent>  {

	private static final Logger LOGGER = LoggerFactory.getLogger(RunningDinnerSettingsUpdatedListener.class);

  private final AfterPartyLocationService afterPartyLocationService;

	private final ProposalExampleService proposalExampleService;

	public RunningDinnerSettingsUpdatedListener(AfterPartyLocationService afterPartyLocationService, ProposalExampleService proposalExampleService) {
		this.afterPartyLocationService = afterPartyLocationService;
		this.proposalExampleService = proposalExampleService;
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
  @Override
  public void onApplicationEvent(RunningDinnerSettingsUpdatedEvent event) {

		try {
			afterPartyLocationService.putGeocodeEventToQueue(event.getRunningDinner());
		} catch (Exception e) {
			LOGGER.error("Geocoding after party location failed for running dinner {}", event.getRunningDinner().getAdminId(), e);
		}

		try {
			proposalExampleService.saveEventDescriptionProposalExample(event.getRunningDinner());
		} catch (Exception e) {
			LOGGER.error("Saving event description proposal example failed for running dinner {}", event.getRunningDinner().getAdminId(), e);
		}
  }

}