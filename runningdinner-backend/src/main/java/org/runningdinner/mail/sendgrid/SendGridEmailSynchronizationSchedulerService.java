package org.runningdinner.mail.sendgrid;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

import org.runningdinner.common.exception.TechnicalException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import net.javacrumbs.shedlock.core.SchedulerLock;


@Service
public class SendGridEmailSynchronizationSchedulerService {

  private static final Logger LOGGER = LoggerFactory.getLogger(SendGridEmailSynchronizationSchedulerService.class);
  
  @Autowired
  private SendGridEmailSynchronizationService emailSynchronizationService;

  @Value("${sendgrid.sync.sent.mails:true}")
  private boolean triggerSynchronizationOfSentMailsEnabled = true;

  /**
   * Execute each 15 minutes (after 30 seconds initial delay)
   */
  @Scheduled(initialDelay = 1000 * 30, fixedDelay = 1000 * 60 * 15) 
  @SchedulerLock(name = "triggerSynchronizationOfSentMails")
  public void triggerSynchronizationOfSentMails() {

    if (triggerSynchronizationOfSentMailsEnabled) {
      synchronizeSentMails(LocalDateTime.now());
    }
  }

  public void synchronizeSentMails(LocalDateTime now) {

    LocalDateTime startDateToRequest = now;

    Optional<MailSynchronizationState> lastMailSynchronizationState = emailSynchronizationService.findLastSuccessfulMailSynchronizationState();
    if (lastMailSynchronizationState.isPresent()) {
      startDateToRequest = lastMailSynchronizationState.get().getSynchronizationDate();
    }

    try {
      Set<String> suppressedEmails = emailSynchronizationService.synchronizeSuppressedEmails(startDateToRequest);
      emailSynchronizationService.createMailSynchronizationState(now, suppressedEmails);
    } catch (Exception e) {
      emailSynchronizationService.createMailSynchronizationState(now, e);
      LOGGER.error("Suppressed Mail Sync failed for startDate {}", startDateToRequest, e);
      throw new TechnicalException(e);
    }
  }

}
