package org.runningdinner.participant;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.runningdinner.core.RunningDinnerRelatedRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ParticipantRepository extends RunningDinnerRelatedRepository<Participant> {

	Optional<Participant> findByEmailIgnoreCaseAndAdminId(String email, String adminId);
	
	Optional<Participant> findFirstByAdminIdOrderByParticipantNumberDesc(String adminId);
	
  List<Participant> findByEmailIgnoreCaseAndIdNotAndAdminId(String email, UUID participantId, String adminId);
  
  List<Participant> findByTeamPartnerWishIgnoreCaseAndAdminId(String email, String adminId);
  
  @Modifying
  @Query("UPDATE Participant p SET p.teamId = NULL WHERE p.adminId = :adminId")
  int updateTeamReferenceToNull(@Param("adminId") String adminId);

	List<Participant> findByIdInAndAdminIdOrderByParticipantNumber(Set<UUID> participantIds, String adminId);
	
  List<Participant> findByIdInAndActivationDateIsNullAndAdminIdOrderByParticipantNumber(Set<UUID> participantIds, String adminId);

	// Get "all" participants queries:
	List<Participant> findByAdminIdOrderByParticipantNumber(String adminId);
	
  List<Participant> findByAdminIdAndActivationDateIsNotNullOrderByParticipantNumber(String adminId);
  
  List<Participant> findByAdminIdAndTeamIdIsNullAndActivationDateIsNotNullOrderByParticipantNumber(String adminId);
  
  List<Participant> findByAdminIdAndTeamIdIsNotNullAndActivationDateIsNotNullOrderByParticipantNumber(String adminId);

}
