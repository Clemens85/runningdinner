package org.runningdinner.participant;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.check.ValidateAdminId;
import org.runningdinner.participant.registrationinfo.ParticipantRegistrationInfo;
import org.runningdinner.participant.registrationinfo.ParticipantRegistrationInfoList;
import org.runningdinner.participant.registrationinfo.ParticipantRegistrationProjection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ParticipantRegistrationsAggregationService {

  private static  final Logger LOGGER = LoggerFactory.getLogger(ParticipantRegistrationsAggregationService.class);
  public static final int PARTICIPANT_PAGE_SIZE = 18;

  private final ParticipantRepository participantRepository;

  private final ParticipantService participantService;

  public ParticipantRegistrationsAggregationService(ParticipantRepository participantRepository, ParticipantService participantService) {
    this.participantRepository = participantRepository;
    this.participantService = participantService;
  }

  public ParticipantRegistrationInfoList findParticipantRegistrations(@ValidateAdminId String dinnerAdminId, LocalDateTime now, int page) {

//    Sort orderBy = Sort.by(new Sort.Order(Sort.Direction.DESC, "activationDate", Sort.NullHandling.NULLS_FIRST),
//      new Sort.Order(Sort.Direction.DESC, "createdAt")); // The second order is only relevant in edge cases when we have several not activated participants

    // Normally I would use the Sort defined above, but Spring Boot 3.4.3 introduced a bug preventing this one to be used....
    PageRequest pageRequest = PageRequest.of(page, PARTICIPANT_PAGE_SIZE);
    Slice<ParticipantRegistrationProjection> resultSlice = participantRepository.findRegistrationInfoSliceByAdminId(dinnerAdminId, pageRequest);

    if (!resultSlice.hasContent()) {
      return new ParticipantRegistrationInfoList(Collections.emptyList(), 0, false);
    }

    List<ParticipantRegistrationInfo> registrations = resultSlice.getContent()
      .stream()
      .map(ParticipantRegistrationInfo::new)
      .collect(Collectors.toList());

    // Aggregate team partner wish root and children:
    registrations = aggregateRegistrations(registrations, dinnerAdminId);

    ParticipantRegistrationInfoList result = new ParticipantRegistrationInfoList(registrations, resultSlice.getNumber(), resultSlice.hasNext());

    LocalDateTime twoDaysBeforeNow = now.minusDays(2);

    var notActivatedRegistrationsOlderThan2Days = registrations
      .stream()
      .filter(p -> p.getActivationDate() == null)
      .filter(p -> p.getCreatedAt().isBefore(twoDaysBeforeNow))
      .collect(Collectors.toList());

    result.setNotActivatedRegistrationsTooOld(notActivatedRegistrationsOlderThan2Days);
    return result;
  }

  private List<ParticipantRegistrationInfo> aggregateRegistrations(List<ParticipantRegistrationInfo> registrations, String adminId) {

    List<ParticipantRegistrationInfo> result = new ArrayList<>(registrations);

    List<ParticipantRegistrationInfo> childRegistrations = HasTeamPartnerWishOriginator.filterChildPartners(result);
    for (var childRegistration : childRegistrations) {
      ParticipantRegistrationInfo rootRegistration = findRootRegistration(childRegistration, result);
      if (rootRegistration != null) {
        // Default case
        rootRegistration.setTeamPartnerWishChildInfo(
          ParticipantName.newName().withFirstname(childRegistration.getFirstnamePart()).andLastname(childRegistration.getLastname()).getFullnameFirstnameFirst()
        );
      } // else: This might happen if this child participant was not in the same slice as the root participant
      result.remove(childRegistration);
    }

    List<ParticipantRegistrationInfo> rootRegistrations = HasTeamPartnerWishOriginator.filterRootPartners(result);
    for (var rootRegistration : rootRegistrations) {
      if (StringUtils.isEmpty(rootRegistration.getTeamPartnerWishChildInfo())) {
        // This might happen if this root participant was not in the same slice as the child participant
        // Otherwise it would already be enriched with the child info
        Participant childParticipant = findChildParticipant(adminId, rootRegistration);
        if (childParticipant == null) {
          LOGGER.error("Could not load child-participant for root participant {} in event {}. Originator-Id was {}",
                       rootRegistration.getId(), adminId, rootRegistration.getTeamPartnerWishOriginatorId());
          continue;
        }
        rootRegistration.setTeamPartnerWishChildInfo(childParticipant.getName().getFullnameFirstnameFirst());
      }
    }

    return result;
  }

  private Participant findChildParticipant(String adminId, ParticipantRegistrationInfo rootRegistration) {
    var rootParticipant = participantService.findParticipantById(adminId, rootRegistration.getId());
    return participantService.findChildParticipantOfTeamPartnerRegistration(adminId, rootParticipant);
  }

  private static ParticipantRegistrationInfo findRootRegistration(ParticipantRegistrationInfo childRegistration, List<ParticipantRegistrationInfo> registrations) {
    return registrations
            .stream()
            .filter(r -> r.isTeamPartnerWishRegistrationChildOf(childRegistration) && r.isTeamPartnerWishRegistratonRoot())
            .findFirst()
            .orElse(null);
  }
}
