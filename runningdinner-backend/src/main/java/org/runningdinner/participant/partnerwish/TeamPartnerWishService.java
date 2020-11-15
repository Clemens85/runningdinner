package org.runningdinner.participant.partnerwish;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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

@Service
public class TeamPartnerWishService {
  
  @Autowired
  private ParticipantRepository participantRepository;
  
  @Autowired
  private ParticipantService participantService;
  
  @Autowired
  private MessageService messageService;
  
  public Optional<TeamPartnerWish> calculateTeamPartnerWishInfo(Participant participant, @ValidateAdminId String adminId) {
    
    if (StringUtils.isNotEmpty(participant.getTeamPartnerWish())) {
      Optional<Participant> teamPartnerWishOptional = participantService.findParticipantByEmail(adminId, participant.getTeamPartnerWish());
      if (!teamPartnerWishOptional.isPresent()) {
        if (messageService.findMessageTaskBySenderAndRecipient(adminId, participant.getEmail(), participant.getTeamPartnerWish(), MessageType.TEAM_PARTNER_WISH).isPresent()) {
          return Optional.empty(); // This shall prevent duplicated invitation emails!
        }
        return Optional.of(TeamPartnerWish.notExisting(participant));
      }
      
      Participant matchingParticipant = teamPartnerWishOptional.get();
      String matchingParticipantPartnerWish = matchingParticipant.getTeamPartnerWish();
      if (StringUtils.isEmpty(matchingParticipantPartnerWish)) {
        return Optional.of(TeamPartnerWish.matchingButMatchHasNoPartnerWish(participant, matchingParticipant));
      }
      if (StringUtils.equalsIgnoreCase(participant.getTeamPartnerWish(), matchingParticipant.getEmail()) && 
          StringUtils.equalsIgnoreCase(participant.getEmail(), matchingParticipantPartnerWish)) {
        return Optional.of(TeamPartnerWish.matchingWithSamePartnerWish(participant, matchingParticipant));
      }
      return Optional.of(TeamPartnerWish.matchingButMatchHasOtherPartnerWish(participant, matchingParticipant));
    }

    // else: No team-partner-wish of this participant, but check if other participant has team-partner-wish for this participant:
    List<Participant> foundParticipants = participantRepository.findByTeamPartnerWishIgnoreCaseAndAdminId(participant.getEmail(), adminId);
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
                                                          .filter(p -> StringUtils.isNotEmpty(p.getTeamPartnerWish()))
                                                          .filter(p -> p.isActivated())
                                                          .collect(Collectors.toList());
    
    for (Participant participantWithTeamPartnerWish : participantsWithTeamPartnerWish) {
      findMatchingParticipantForTeamPartnerWish(participantWithTeamPartnerWish, participantsWithTeamPartnerWish)
        .ifPresent(foundMachingParticipant -> result.add(new TeamPartnerWishTuple(foundMachingParticipant, participantWithTeamPartnerWish)));
    }
   
    // With the logic above we created duplicates of teampartner-wishes, now we remove them:
    return result
            .stream()
            .distinct()
            .collect(Collectors.toList());
  }
  
  private static Optional<Participant> findMatchingParticipantForTeamPartnerWish(Participant participantWithTeamPartnerWish, List<Participant> allParticipants) {
   
    final String teamPartnerWish = participantWithTeamPartnerWish.getTeamPartnerWish().trim().toLowerCase();
    
    Optional<Participant> result = allParticipants
                                    .stream()
                                    .filter(other -> !other.equals(participantWithTeamPartnerWish))
                                    .filter(other -> other.getEmail().trim().equalsIgnoreCase(teamPartnerWish))
                                    .filter(other -> other.getTeamPartnerWish().trim().equalsIgnoreCase(participantWithTeamPartnerWish.getEmail().trim()))
                                    .filter(other -> other.isActivated())
                                    .findFirst();
    return result;
  }

  
}
