package org.runningdinner.admin;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantService;
import org.runningdinner.test.util.PrivateFieldAccessor;

public class ParticipantTest {
  
  @Test
  public void isJoinRegistration() {

    UUID inviteeId = UUID.randomUUID();
    UUID invitorId = UUID.randomUUID();
    
    Participant invitor = new Participant();
    PrivateFieldAccessor.setField(invitor, "id", invitorId);
    Participant invitee = new Participant();
    PrivateFieldAccessor.setField(invitee, "id", inviteeId);

    assertThat(invitor.isTeamPartnerWishRegistrationChildOf(invitee)).isFalse();
    assertThat(invitee.isTeamPartnerWishRegistrationChildOf(invitor)).isFalse();
    
    invitor.setTeamPartnerWishOriginatorId(invitorId);
    invitee.setTeamPartnerWishOriginatorId(UUID.randomUUID());
    assertThat(invitor.isTeamPartnerWishRegistrationChildOf(invitee)).isFalse();
    assertThat(invitee.isTeamPartnerWishRegistrationChildOf(invitor)).isFalse();
    
    invitor.setTeamPartnerWishOriginatorId(invitorId);
    invitee.setTeamPartnerWishOriginatorId(invitorId);
    assertThat(invitor.isTeamPartnerWishRegistrationChildOf(invitee)).isTrue();
    assertThat(invitee.isTeamPartnerWishRegistrationChildOf(invitor)).isTrue();
  }
  
  @Test
  public void isTeamPartnerWishRegistrator() {

    UUID inviteeId = UUID.randomUUID();
    UUID invitorId = UUID.randomUUID();
    
    Participant invitor = new Participant();
    PrivateFieldAccessor.setField(invitor, "id", invitorId);
    Participant invitee = new Participant();
    PrivateFieldAccessor.setField(invitee, "id", inviteeId);

    invitor.setTeamPartnerWishOriginatorId(invitorId);
    invitee.setTeamPartnerWishOriginatorId(invitorId);
    assertThat(invitor.isTeamPartnerWishRegistratonRoot()).isTrue();
    assertThat(invitee.isTeamPartnerWishRegistratonRoot()).isFalse();
  }
  
  @Test
  public void hasConsistentTeamPartnerWishRegistration() {
    
    Participant a = newParticipant(UUID.randomUUID(), null);
    Participant b = newParticipant(UUID.randomUUID(), null);
    assertThat(ParticipantService.hasConsistentTeamPartnerWishRegistration(List.of(a, b))).isTrue();
    
    a.setTeamPartnerWishOriginatorId(a.getId());
    b.setTeamPartnerWishOriginatorId(a.getId());
    assertThat(ParticipantService.hasConsistentTeamPartnerWishRegistration(List.of(a, b))).isTrue();
    
    b.setTeamPartnerWishOriginatorId(UUID.randomUUID());
    assertThat(ParticipantService.hasConsistentTeamPartnerWishRegistration(List.of(a, b))).isFalse();
    
    b.setTeamPartnerWishOriginatorId(null);
    assertThat(ParticipantService.hasConsistentTeamPartnerWishRegistration(List.of(a, b))).isFalse();

    assertThat(ParticipantService.hasConsistentTeamPartnerWishRegistration(List.of(a))).isTrue();
  }
  
  static Participant newParticipant(UUID id, UUID teamPartnerWishOriginatorId) {
    
    Participant result = new Participant();
    PrivateFieldAccessor.setField(result, "id", id);
    result.setTeamPartnerWishOriginatorId(teamPartnerWishOriginatorId);
    return result;
  }
}
