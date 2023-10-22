package org.runningdinner.participant.registrationinfo;

import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;

/**
 * Use in Query as Projection to retrieve only needed attributes from Participant
 */
public interface ParticipantRegistrationProjection {

  UUID getId();

  int getParticipantNumber();
  
  String getEmail();
  
  String getMobileNumber();
  
  LocalDateTime getCreatedAt();
  
  LocalDateTime getActivationDate();
  
  String getActivatedBy();
  
  @Value("#{target.name.firstnamePart}")
  String getFirstnamePart();
  
  @Value("#{target.name.lastname}")
  String getLastname();
}
