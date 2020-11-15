package org.runningdinner.mail.sendgrid;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MailSynchronizationStateRepository extends JpaRepository<MailSynchronizationState, UUID> {

  Optional<MailSynchronizationState> findFirstBySynchronizationResultNotOrderBySynchronizationDateDesc(MailSynchronizationResult synchronizationResult);
}
