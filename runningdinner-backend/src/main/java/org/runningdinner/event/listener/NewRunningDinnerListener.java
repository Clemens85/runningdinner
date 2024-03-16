
package org.runningdinner.event.listener;

import org.runningdinner.admin.AfterPartyLocationService;
import org.runningdinner.admin.message.MessageService;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.event.NewRunningDinnerEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Component
public class NewRunningDinnerListener implements ApplicationListener<NewRunningDinnerEvent> {

  private static final Logger LOGGER = LoggerFactory.getLogger(NewRunningDinnerListener.class);

  private MessageService messageService;

  private AfterPartyLocationService afterParLocationService;
  
  public NewRunningDinnerListener(MessageService messageService, AfterPartyLocationService afterParLocationService) {
    this.messageService = messageService;
    this.afterParLocationService = afterParLocationService;
  }

  @Override
  public void onApplicationEvent(NewRunningDinnerEvent event) {

    RunningDinner newRunningDinner = event.getNewRunningDinner();
    
    LOGGER.info("Created {} for email {}", newRunningDinner.getAdminId(), newRunningDinner.getEmail());
   
    messageService.sendRunningDinnerCreatedMessage(newRunningDinner);
    
    afterParLocationService.putGeocodeEventToQueue(newRunningDinner);
  }
}
