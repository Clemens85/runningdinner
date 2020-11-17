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

public interface RunningDinnerRepository extends JpaRepository<RunningDinner, UUID> {

	RunningDinner findByAdminId(final String adminId);

	RunningDinner findByPublicSettingsPublicIdAndRegistrationTypeInAndCancellationDateIsNull(String publicId, Collection<RegistrationType> registrationTypes);

	List<RunningDinner> findAllByRegistrationTypeAndDateAfterAndRunningDinnerTypeAndCancellationDateIsNullOrderByDateAsc(RegistrationType registrationType, 
	                                                                                                                     LocalDate now,
	                                                                                                                     RunningDinnerType runningDinnerType);

  RunningDinner findBySelfAdministrationId(UUID selfAdministrationId);

  List<RunningDinner> findByDateBefore(LocalDate date);

  List<RunningDinner> findByCancellationDateLessThanEqual(LocalDateTime date);

}
