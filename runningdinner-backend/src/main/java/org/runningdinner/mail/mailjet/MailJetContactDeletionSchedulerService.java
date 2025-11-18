package org.runningdinner.mail.mailjet;

import net.javacrumbs.shedlock.core.SchedulerLock;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class MailJetContactDeletionSchedulerService {

	private static final Logger LOGGER = LoggerFactory.getLogger(MailJetContactDeletionSchedulerService.class);

	private final boolean schedulerEnabled;

	private final MailJetContactDeletionService mailJetContactDeletionService;

	public MailJetContactDeletionSchedulerService(MailJetContactDeletionService mailJetContactDeletionService,
																								@Value("${delete.mailjet.contacts.scheduler.enabled:true}") boolean schedulerEnabled) {
		this.mailJetContactDeletionService = mailJetContactDeletionService;
		this.schedulerEnabled = schedulerEnabled;
	}

	/**
	 * Perform job each 12 hours
	 */
	@Scheduled(fixedRate = 1000 * 60 * 60 * 12)
	@SchedulerLock(name = "triggerDeleteOldContacts")
	public void deleteOldContacts() {

		if (!schedulerEnabled) {
			LOGGER.warn("deleteOldContacts scheduler is disabled!");
			return;
		}

		try {
			mailJetContactDeletionService.performContactDeletion();
		} catch (Exception e) {
			LOGGER.error("deleteOldContacts failed unexpectedly", e);
		}
	}


}
