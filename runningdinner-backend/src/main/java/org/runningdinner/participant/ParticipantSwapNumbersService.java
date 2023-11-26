package org.runningdinner.participant;

import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.common.Issue;
import org.runningdinner.common.IssueKeys;
import org.runningdinner.common.IssueList;
import org.runningdinner.common.IssueType;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.util.CoreUtil;
import org.runningdinner.event.publisher.EventPublisher;
import org.runningdinner.participant.rest.ParticipantWithListNumberTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.Assert;

import java.util.*;

@Service
public class ParticipantSwapNumbersService {
  
  private final ParticipantRepository participantRepository;

  private final ParticipantService participantService;
  
  private final EventPublisher eventPublisher;

  private final RunningDinnerService runningDinnerService;
  
  public ParticipantSwapNumbersService(ParticipantRepository participantRepository,
      ParticipantService participantService,
      RunningDinnerService runningDinnerService,
      EventPublisher eventPublisher) {
    
    this.participantRepository = participantRepository;
    this.participantService = participantService;
    this.runningDinnerService = runningDinnerService;
    this.eventPublisher = eventPublisher;
  }

  @Transactional
  public void swapParticipantNumbers(@ValidateAdminId String adminId, UUID participantIdA, UUID participantIdB) {
   
    List<Participant> firstAndSecondParticipant = participantService.findParticipantsByIds(adminId, Set.of(participantIdA, participantIdB));
    Participant participantA = CoreUtil.findById(firstAndSecondParticipant, participantIdA);
    Participant participantB = CoreUtil.findById(firstAndSecondParticipant, participantIdB);
    Assert.notNull(participantA, "Could not find participant with id " + participantIdA + " in " + adminId);
    Assert.notNull(participantB, "Could not find participant with id " + participantIdB + " in " + adminId);
    
    Assert.state(!Objects.equals(participantA, participantB), "Cannot swap same participant: " + participantA);
    
    Assert.isNull(participantA.getTeamId(), "Cannot swap participants when teams already exist");
    Assert.isNull(participantB.getTeamId(), "Cannot swap participants when teams already exist");
    
    var runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    
    Participant firstParticipant = participantA;
    Participant secondParticipant = participantB;
    if (participantA.getParticipantNumber() > participantB.getParticipantNumber()) {
      firstParticipant = participantB;
      secondParticipant = participantA;
    }
    
    var participantList = participantService.findActiveParticipantList(adminId);
    List<ParticipantWithListNumberTO> allParticipants = ParticipantService.mapToRawList(participantList);
  
    final int firstNumber = firstParticipant.getParticipantNumber();
    final int secondNumber = secondParticipant.getParticipantNumber();
    
    moveSecondParticipantUpTheListDefaultCase(secondParticipant, firstParticipant, allParticipants, firstNumber, adminId);
    
    // Special case for second participant moving up (which is however a main case from a user's point of a view) 
    if (!secondParticipant.isTeamPartnerWishRegistratonRoot() && secondParticipant.getTeamPartnerWishOriginatorId() != null) { 
      // Child shall be moved up (main use case when child is separated from root e.g. by waitinglist)
      Participant rootOfSecondParticipant = participantService.findParticipantById(adminId, secondParticipant.getTeamPartnerWishOriginatorId());
      if (firstParticipant.getTeamPartnerWishOriginatorId() != null) {
        throw new ValidationException(new IssueList(new Issue(IssueKeys.PARTICIPANT_SWAP_NUMBER_CHILD_ONLY_POSSIBLE_WITH_SINGLE_PARTICIPANT, IssueType.VALIDATION)));
      }
      // This is actually the same case as above, but we pick the root for moving up, so that our child will automatically also be moved up (which is what we actually desire)
      moveSecondParticipantUpTheListDefaultCase(rootOfSecondParticipant, firstParticipant, allParticipants, firstNumber, adminId);
    }
    
    moveFirstParticipantDownTheList(firstParticipant, secondParticipant, allParticipants, secondNumber, adminId);
    
    emitParticipantNumbersSwappedEvent(runningDinner, firstParticipant, secondParticipant);
  }
  
  private void moveSecondParticipantUpTheListDefaultCase(Participant secondParticipant, 
                                              Participant firstParticipant, 
                                              List<ParticipantWithListNumberTO> allParticipants,
                                              int firstParticipantNrOriginal,
                                              String adminId) {
    
    if (secondParticipant.isTeamPartnerWishRegistratonRoot()) {
      Participant childOfSecondParticipant = participantService.findChildParticipantOfTeamPartnerRegistration(adminId, secondParticipant);
      secondParticipant.setParticipantNumber(firstParticipantNrOriginal);
      childOfSecondParticipant.setParticipantNumber(firstParticipantNrOriginal + 1);

      if (!firstParticipant.isTeamPartnerWishRegistratonRoot()) {
        List<ParticipantWithListNumberTO> participantListToRewrite = getSublistInParticipantInterval(allParticipants, firstParticipant, secondParticipant);
        int followupParticipantNr = firstParticipantNrOriginal + 2;
        for (ParticipantWithListNumberTO p : participantListToRewrite) {
          Participant followupParticipant = participantService.findParticipantById(adminId, p.getId());
          followupParticipant.setParticipantNumber(followupParticipantNr++);
          participantRepository.save(followupParticipant);
        }
      }
      
      participantRepository.save(secondParticipant);
      participantRepository.save(childOfSecondParticipant);
    } else if (secondParticipant.getTeamPartnerWishOriginatorId() == null) {
      secondParticipant.setParticipantNumber(firstParticipantNrOriginal);
      participantRepository.save(secondParticipant);
    }
  }
  
  private void moveFirstParticipantDownTheList(Participant firstParticipant, 
                                               Participant secondParticipant, 
                                               List<ParticipantWithListNumberTO> allParticipants,
                                               int secondParticipantNrOriginal,
                                               String adminId) {

    if (firstParticipant.isTeamPartnerWishRegistratonRoot()) {
      Participant childOfFirstParticipant = participantService.findChildParticipantOfTeamPartnerRegistration(adminId, firstParticipant);
      
      firstParticipant.setParticipantNumber(secondParticipantNrOriginal);
      childOfFirstParticipant.setParticipantNumber(secondParticipantNrOriginal + 1);
      
      if (!secondParticipant.isTeamPartnerWishRegistratonRoot()) {
        List<ParticipantWithListNumberTO> participantListToRewrite = getSublistInParticipantInterval(allParticipants, secondParticipant, null);
        int followupParticipantNr = secondParticipantNrOriginal + 2;
        for (ParticipantWithListNumberTO p : participantListToRewrite) {
          Participant followupParticipant = participantService.findParticipantById(adminId, p.getId());
          followupParticipant.setParticipantNumber(followupParticipantNr++);
          participantRepository.save(followupParticipant);
        }
      }
      
      participantRepository.save(firstParticipant);
      participantRepository.save(childOfFirstParticipant);
    } else if (firstParticipant.getTeamPartnerWishOriginatorId() == null) {
      int numberToSet = !secondParticipant.isTeamPartnerWishRegistratonRoot() ? secondParticipantNrOriginal : secondParticipantNrOriginal + 1;
      firstParticipant.setParticipantNumber(numberToSet);
      participantRepository.save(firstParticipant); 
    } else {
      throw new ValidationException(new IssueList(new Issue(IssueKeys.PARTICIPANT_SWAP_NUMBER_VIOLATES_TEAM_PARTNER_WISH, IssueType.VALIDATION)));
    }
  }
  
  private List<ParticipantWithListNumberTO> getSublistInParticipantInterval(List<ParticipantWithListNumberTO> allParticipants, 
                                                                            Participant startExclusive, 
                                                                            Participant endExclusive) {
    
    List<ParticipantWithListNumberTO> result = new ArrayList<>();
    
    boolean addToList = false;
    for (var participant : allParticipants) {
      if (endExclusive != null && Objects.equals(participant.getId(), endExclusive.getId())) {
        break;
      }
      if (addToList) {
        result.add(participant);
      }
      if (Objects.equals(participant.getId(), startExclusive.getId())) {
        addToList = true;
      }
    }
    return result;
  }

  private void emitParticipantNumbersSwappedEvent(final RunningDinner runningDinner, Participant firstParticipant, Participant secondParticipant) {

    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
      @Override
      public void afterCommit() {
        eventPublisher.notifyParticipantNumbersSwappedEvent(firstParticipant, secondParticipant, runningDinner);
      }
    });
  }

}
