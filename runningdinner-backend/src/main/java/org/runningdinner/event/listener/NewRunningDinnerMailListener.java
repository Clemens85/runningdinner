
package org.runningdinner.event.listener;

import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.dinner.RunningDinnerRelatedMessage;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.event.NewRunningDinnerEvent;
import org.runningdinner.mail.formatter.RunningDinnerEventCreatedMessageFormatter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Component
public class NewRunningDinnerMailListener implements ApplicationListener<NewRunningDinnerEvent> {

  private MessageService messageService;
  
  private RunningDinnerEventCreatedMessageFormatter runningDinnerEventCreatedMessageFormatter;

  @Autowired
  public NewRunningDinnerMailListener(MessageService messageService, RunningDinnerEventCreatedMessageFormatter newRunningDinnerEventFormatter) {
    this.messageService = messageService;
    this.runningDinnerEventCreatedMessageFormatter = newRunningDinnerEventFormatter;
  }

  @Override
  public void onApplicationEvent(NewRunningDinnerEvent event) {

    RunningDinner newRunningDinner = event.getNewRunningDinner();
    messageService.sendRunningDinnerCreatedMessage(newRunningDinner);
  }
}
