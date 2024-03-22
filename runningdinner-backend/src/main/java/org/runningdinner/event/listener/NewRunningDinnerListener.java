
package org.runningdinner.event.listener;

import org.runningdinner.admin.AfterPartyLocationService;
import org.runningdinner.admin.message.MessageService;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.event.NewRunningDinnerEvent;
import org.runningdinner.messaging.integration.MessagingIntegrationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Component
public class NewRunningDinnerListener implements ApplicationListener<NewRunningDinnerEvent> {

  private static final Logger LOGGER = LoggerFactory.getLogger(NewRunningDinnerListener.class);

  private final MessageService messageService;

  private final AfterPartyLocationService afterParLocationService;

  private final MessagingIntegrationService messagingIntegrationService;

  public NewRunningDinnerListener(MessageService messageService, AfterPartyLocationService afterParLocationService, MessagingIntegrationService messagingIntegrationService) {
    this.messageService = messageService;
    this.afterParLocationService = afterParLocationService;
    this.messagingIntegrationService = messagingIntegrationService;
  }

  @Override
  public void onApplicationEvent(NewRunningDinnerEvent event) {

    RunningDinner newRunningDinner = event.getNewRunningDinner();
    
    LOGGER.info("Created {} for email {}", newRunningDinner.getAdminId(), newRunningDinner.getEmail());
   
    messageService.sendRunningDinnerCreatedMessage(newRunningDinner);
    
    afterParLocationService.putGeocodeEventToQueue(newRunningDinner);

    messagingIntegrationService.handleNewOrUpdatedRunningDinner(newRunningDinner);
  }
}
