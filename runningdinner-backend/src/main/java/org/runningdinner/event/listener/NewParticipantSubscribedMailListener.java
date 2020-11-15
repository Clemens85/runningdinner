package org.runningdinner.event.listener;

import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.dinner.RunningDinnerRelatedMessage;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.event.NewParticipantSubscribedEvent;
import org.runningdinner.mail.formatter.NewParticipantSubscribedFormatter;
import org.runningdinner.participant.Participant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Component
public class NewParticipantSubscribedMailListener implements ApplicationListener<NewParticipantSubscribedEvent> {

  @Autowired
  private MessageService messageService;
  
  @Autowired
  private NewParticipantSubscribedFormatter newParticipantSubscribedFormatter;

  @Override
  public void onApplicationEvent(NewParticipantSubscribedEvent event) {

    final RunningDinner runningDinner = event.getRunningDinner();
    final Participant participant = event.getParticipant();
    
    RunningDinnerRelatedMessage message = newParticipantSubscribedFormatter.formatNewParticipantSubscribedMessage(runningDinner, participant);
    
    messageService.sendSubscriptionActivationMail(message, participant);
  }

}
