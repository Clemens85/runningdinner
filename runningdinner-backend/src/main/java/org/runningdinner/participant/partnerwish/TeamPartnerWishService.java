package org.runningdinner.participant.partnerwish;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.job.MessageType;
import org.runningdinner.core.RunningDinnerConfig;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.ParticipantRepository;
import org.runningdinner.participant.ParticipantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

@Service
public class TeamPartnerWishService {
  
  @Autowired
  private ParticipantRepository participantRepository;
  
  @Autowired
  private ParticipantService participantService;
  
  @Autowired
  private MessageService messageService;
  
  public Optional<TeamPartnerWish> calculateTeamPartnerWishInfo(Participant participant, @ValidateAdminId String adminId) {
    
    if (StringUtils.isNotEmpty(participant.getTeamPartnerWishEmail())) {
      List<Participant> foundTeamPartnerWish = participantService.findParticipantByEmail(adminId, participant.getTeamPartnerWishEmail());
      if (CollectionUtils.isEmpty(foundTeamPartnerWish)) {
        var messageTasksForSenderAndRecipient = messageService.findMessageTasksBySenderAndRecipient(adminId, participant.getEmail(), participant.getTeamPartnerWishEmail(), MessageType.TEAM_PARTNER_WISH);
        if (CollectionUtils.isNotEmpty(messageTasksForSenderAndRecipient)) {
          return Optional.empty(); // This shall prevent duplicated invitation emails!
        }
        return Optional.of(TeamPartnerWish.notExisting(participant));
      }
      
      Participant matchingParticipant = foundTeamPartnerWish.get(0);
      String matchingParticipantPartnerWish = matchingParticipant.getTeamPartnerWishEmail();
      if (StringUtils.isEmpty(matchingParticipantPartnerWish)) {
        return Optional.of(TeamPartnerWish.matchingButMatchHasNoPartnerWish(participant, matchingParticipant));
      }
      if (StringUtils.equalsIgnoreCase(participant.getTeamPartnerWishEmail(), matchingParticipant.getEmail()) && 
          StringUtils.equalsIgnoreCase(participant.getEmail(), matchingParticipantPartnerWish)) {
        return Optional.of(TeamPartnerWish.matchingWithSamePartnerWish(participant, matchingParticipant));
      }
      return Optional.of(TeamPartnerWish.matchingButMatchHasOtherPartnerWish(participant, matchingParticipant));
    }

    // else: No team-partner-wish of this participant, but check if other participant has team-partner-wish for this participant:
    List<Participant> foundParticipants = participantRepository.findByTeamPartnerWishEmailIgnoreCaseAndAdminId(participant.getEmail(), adminId);
    if (CollectionUtils.isNotEmpty(foundParticipants)) {
      return Optional.of(TeamPartnerWish.noPartnerWishButOtherTeamPartnerWishes(participant, foundParticipants));
    }
    
    return Optional.empty();
  }
  
  public static List<TeamPartnerWishTuple> getTeamPartnerWishTuples(List<Participant> participants, RunningDinnerConfig config) {
    
    List<TeamPartnerWishTuple> result = new ArrayList<>();
    
    if (config.isTeamPartnerWishDisabled()) {
      return result;
    }
    
    List<Participant> participantsWithTeamPartnerWish = participants
                                                          .stream()
                                                          .filter(p -> StringUtils.isNotEmpty(p.getTeamPartnerWishEmail()))
                                                          .filter(p -> p.isActivated())
                                                          .collect(Collectors.toList());
    
    for (Participant participantWithTeamPartnerWish : participantsWithTeamPartnerWish) {
      findMatchingParticipantForTeamPartnerWishEmail(participantWithTeamPartnerWish, participantsWithTeamPartnerWish)
        .ifPresent(foundMachingParticipant -> result.add(new TeamPartnerWishTuple(foundMachingParticipant, participantWithTeamPartnerWish)));
    }
   
    
    for (Participant p : participants) {
      if (p.isTeamPartnerWishRegistratonRoot()) {
        Participant foundTeamPartnerWishParticipant = findChildParticipantWithTeamPartnerWishOriginatorId(participants, p.getTeamPartnerWishOriginatorId());
        if (foundTeamPartnerWishParticipant != null) {
          Assert.state(!Objects.equals(p, foundTeamPartnerWishParticipant), "Cannot build team with only one participant: " + foundTeamPartnerWishParticipant);
          result.add(new TeamPartnerWishTuple(p, foundTeamPartnerWishParticipant));
        }
      }
    }
    
    // With the logic above we created duplicates of teampartner-wishes, now we remove them:
    return result
            .stream()
            .distinct()
            .collect(Collectors.toList());
  }
  
  private static Participant findChildParticipantWithTeamPartnerWishOriginatorId(List<Participant> participants, UUID teamPartnerWishOriginatorId) {
    
    return participants
            .stream()
            .filter(p -> Objects.equals(p.getTeamPartnerWishOriginatorId(), teamPartnerWishOriginatorId))
            .filter(p -> !Objects.equals(p.getId(), teamPartnerWishOriginatorId))
            .findFirst()
            .orElse(null);
  }
  
  
  private static Optional<Participant> findMatchingParticipantForTeamPartnerWishEmail(Participant participantWithTeamPartnerWish, List<Participant> allParticipants) {
   
    final String teamPartnerWish = participantWithTeamPartnerWish.getTeamPartnerWishEmail().trim().toLowerCase();
    
    Optional<Participant> result = allParticipants
                                    .stream()
                                    .filter(other -> !other.equals(participantWithTeamPartnerWish))
                                    .filter(other -> other.getEmail().trim().equalsIgnoreCase(teamPartnerWish))
                                    .filter(other -> other.getTeamPartnerWishEmail().trim().equalsIgnoreCase(participantWithTeamPartnerWish.getEmail().trim()))
                                    .filter(other -> other.isActivated())
                                    .findFirst();
    return result;
  }

  
}
