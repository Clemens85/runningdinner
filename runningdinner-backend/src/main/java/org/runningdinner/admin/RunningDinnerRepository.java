package org.runningdinner.admin;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinner.RunningDinnerType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RunningDinnerRepository extends JpaRepository<RunningDinner, UUID> {

	RunningDinner findByAdminId(final String adminId);

    /** Find all dinners by organizer email across all events (for portal token resolution).
     * Caller must pass a pre-lowercased email so LOWER(email) = :email generates a consistent comparison. */
    @Query("SELECT d FROM RunningDinner d WHERE LOWER(d.email) = :email")
    List<RunningDinner> findAllByEmailLower(@Param("email") String lowerCaseEmail);

	RunningDinner findByPublicSettingsPublicIdAndRegistrationTypeInAndCancellationDateIsNull(String publicId, Collection<RegistrationType> registrationTypes);

	List<RunningDinner> findAllByRegistrationTypeAndDateAfterAndRunningDinnerTypeAndCancellationDateIsNullOrderByDateAsc(RegistrationType registrationType, 
	                                                                                                                     LocalDate now,
	                                                                                                                     RunningDinnerType runningDinnerType);

  RunningDinner findBySelfAdministrationId(UUID selfAdministrationId);

  List<RunningDinner> findByDateBefore(LocalDate date);

  List<RunningDinner> findByCancellationDateLessThanEqual(LocalDateTime date);

}
