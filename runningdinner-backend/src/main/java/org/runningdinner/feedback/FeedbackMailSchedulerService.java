package org.runningdinner.feedback;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import net.javacrumbs.shedlock.core.SchedulerLock;

@Service
public class FeedbackMailSchedulerService {
  
  private static Logger LOGGER = LoggerFactory.getLogger(FeedbackMailSchedulerService.class);

  @Autowired
  private FeedbackService feedbackService;

  @Value("${deliver.feedback.mail.scheduler.enabled:true}")
  private final boolean schedulerEnabled = true;
  
  /**
   * Perform job each 15 minutes
   */
  @Scheduled(fixedRateString = "${deliver.feedback.mail.scheduler.send.interval}")
  @SchedulerLock(name = "triggerSendFeedbacksAsMail")
  public void triggerSendFeedbacksAsMail() {
  
    if (schedulerEnabled) {
      sendFeedbacksAsMail();
    }
  }
  
  public void sendFeedbacksAsMail() {
    
    List<Feedback> feedbacksNotDelivered = feedbackService.findAllNotDeliveredFeedbacks();
    for (Feedback feedbackNotDelivered : feedbacksNotDelivered) {
      deliverFeedback(feedbackNotDelivered);
    }
  }

  public void deliverFeedback(Feedback feedback) {

    try {
     feedbackService.deliverFeedbackInNewTransaction(feedback); 
    } catch (Exception e) {
      LOGGER.error("Failed to deliver {}", feedback, e);
    }
  }
  
}
