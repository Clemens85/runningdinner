package org.runningdinner.event.listener;

import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.dinner.RunningDinnerRelatedMessage;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.event.NewParticipantSubscribedEvent;
import org.runningdinner.mail.formatter.NewParticipantSubscribedFormatter;
import org.runningdinner.participant.Participant;
import org.runningdinner.payment.paymentoptions.PaymentOptions;
import org.runningdinner.payment.paymentoptions.PaymentOptionsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Component
public class NewParticipantSubscribedMailListener implements ApplicationListener<NewParticipantSubscribedEvent> {

  @Autowired
  private MessageService messageService;
  
  @Autowired
  private NewParticipantSubscribedFormatter newParticipantSubscribedFormatter;
  
  @Autowired
  private PaymentOptionsService paymentOptionsService;

  @Override
  public void onApplicationEvent(NewParticipantSubscribedEvent event) {

    final RunningDinner runningDinner = event.getRunningDinner();
    final Participant participant = event.getParticipant();
    
    PaymentOptions paymentOptions = paymentOptionsService.findPaymentOptionsByAdminId(runningDinner.getAdminId()).orElse(null);
    
    RunningDinnerRelatedMessage message;
    if (paymentOptions == null) {
      message = newParticipantSubscribedFormatter.formatNewParticipantSubscribedMessage(runningDinner, participant);
    } else {
      message = newParticipantSubscribedFormatter.formatNewParticipantSubscribedWithPaymentMessage(runningDinner, participant, paymentOptions);
    }
    
    messageService.sendSubscriptionActivationMail(message, participant);
  }

}
