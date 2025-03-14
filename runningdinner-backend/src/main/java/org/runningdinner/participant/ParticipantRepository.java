package org.runningdinner.participant;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.runningdinner.core.RunningDinnerRelatedRepository;
import org.runningdinner.participant.registrationinfo.ParticipantRegistrationProjection;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ParticipantRepository extends RunningDinnerRelatedRepository<Participant> {

  List<Participant> findByEmailIgnoreCaseAndAdminIdOrderByParticipantNumber(String email, String adminId);
	
  Optional<Participant> findFirstByAdminIdOrderByParticipantNumberDesc(String adminId);
	
  List<Participant> findByEmailIgnoreCaseAndIdNotAndAdminId(String email, UUID participantId, String adminId);
  
  List<Participant> findByTeamPartnerWishEmailIgnoreCaseAndAdminId(String email, String adminId);
  
  @Modifying
  @Query("UPDATE Participant p SET p.teamId = NULL, p.host = FALSE WHERE p.adminId = :adminId")
  int updateTeamReferenceAndHostToNull(@Param("adminId") String adminId);

  List<Participant> findByIdInAndAdminIdOrderByParticipantNumber(Set<UUID> participantIds, String adminId);
	
  // Get "all" participants queries:
  List<Participant> findByAdminIdOrderByParticipantNumber(String adminId);
	
  List<Participant> findByAdminIdAndActivationDateIsNotNullOrderByParticipantNumber(String adminId);
  
  List<Participant> findByAdminIdAndTeamIdIsNullAndActivationDateIsNotNullOrderByParticipantNumber(String adminId);
  
  List<Participant> findByAdminIdAndTeamIdIsNotNullAndActivationDateIsNotNullOrderByParticipantNumber(String adminId);

  Participant findByTeamPartnerWishOriginatorIdAndIdNotAndAdminId(UUID teamPartnerWishOriginatorId, UUID participantId, String adminId);

  // Spring Boot 3.4.3 introduced a bug which prevented to use nullsFirst sort criteria in Pageable (-> ParticipantRegistrationsAggregationService)
  @Query("SELECT p FROM Participant p WHERE p.adminId = :adminId ORDER BY p.activationDate DESC NULLS FIRST, p.createdAt DESC")
  Slice<ParticipantRegistrationProjection> findRegistrationInfoSliceByAdminId(@Param("adminId") String adminId, Pageable pageable);
//  Slice<ParticipantRegistrationProjection> findRegistrationInfoSliceByAdminId(String adminId, Pageable pageable);
  

}
