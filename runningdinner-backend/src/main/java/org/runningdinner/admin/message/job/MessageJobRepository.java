package org.runningdinner.admin.message.job;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.runningdinner.core.RunningDinnerRelatedRepository;

public interface MessageJobRepository extends RunningDinnerRelatedRepository<MessageJob> {

  List<MessageJob> findByAdminIdAndMessageType(String adminId, MessageType messageType);

  MessageJob findByAdminIdAndId(String adminId, UUID messageJobId);
  
  MessageJob findFirstByMessageTypeInOrderByCreatedAtDesc(Collection<MessageType> messageTypes);
  
}
