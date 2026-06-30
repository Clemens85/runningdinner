package org.runningdinner.portal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Set;
import java.util.UUID;

public interface PortalMessageReadReceiptRepository extends JpaRepository<PortalMessageReadReceipt, UUID> {

  /**
   * Returns all message task IDs that the given participant has already read.
   */
  @Query("SELECT r.messageTaskId FROM PortalMessageReadReceipt r WHERE r.participantId = :participantId AND r.messageTaskId IN :messageTaskIds")
  Set<UUID> findReadMessageTaskIds(@Param("participantId") UUID participantId,
                                   @Param("messageTaskIds") Set<UUID> messageTaskIds);

  boolean existsByParticipantIdAndMessageTaskId(UUID participantId, UUID messageTaskId);
}
