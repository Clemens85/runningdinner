package org.runningdinner.admin.message.job.stats;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface MessageSenderHistoryRepository extends JpaRepository<MessageSenderHistory, UUID> {

  @Query("SELECT m FROM MessageSenderHistory m WHERE m.sendingDate >= :from AND m.sendingDate <= :to ORDER BY m.sendingDate DESC")
  List<MessageSenderHistory> findAllBySendingDateBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

  @Query("SELECT m FROM MessageSenderHistory m WHERE m.sendingDate < :cutoffDate ORDER BY m.sendingDate DESC")
  List<MessageSenderHistory> findMessageSenderHistoryBefore(@Param("cutoffDate") LocalDateTime cutoffDate);
}
