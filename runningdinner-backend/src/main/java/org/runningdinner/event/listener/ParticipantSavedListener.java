package org.runningdinner.event.listener;

import org.runningdinner.event.ParticipantSavedEvent;
import org.runningdinner.geocoder.ParticipantGeocodeEventPublisher;
import org.runningdinner.messaging.integration.MessagingIntegrationService;
import org.runningdinner.participant.Participant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

@Component
public class ParticipantSavedListener implements ApplicationListener<ParticipantSavedEvent> {

  private static final Logger LOGGER = LoggerFactory.getLogger(ParticipantSavedListener.class);

  private final ParticipantGeocodeEventPublisher participantGeocodeEventPublisher;

  private final MessagingIntegrationService messagingIntegrationService;

  public ParticipantSavedListener(ParticipantGeocodeEventPublisher participantGeocodeEventPublisher, MessagingIntegrationService messagingIntegrationService) {
    this.participantGeocodeEventPublisher = participantGeocodeEventPublisher;
    this.messagingIntegrationService = messagingIntegrationService;
  }

  @Override
  public void onApplicationEvent(ParticipantSavedEvent event) {

    Participant participant = event.getParticipant();
    try {
      participantGeocodeEventPublisher.sendMessageToQueueAsync(participant);
    } catch (Exception e) {
      LOGGER.error("Error while calling sendMessageToQueueAsync for {}", participant, e);
    }

    messagingIntegrationService.handleParticipantSaved(participant, event.getRunningDinner());

  }
}
