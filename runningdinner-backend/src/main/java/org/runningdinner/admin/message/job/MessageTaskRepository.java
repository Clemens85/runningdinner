package org.runningdinner.admin.message.job;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.runningdinner.core.RunningDinnerRelatedRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MessageTaskRepository extends RunningDinnerRelatedRepository<MessageTask> {

  List<MessageTask> findBySendingStatusOrderByCreatedAtAsc(SendingStatus sendingStatus);
  
  List<MessageTask> findByParentJobIdOrderByCreatedAtAsc(UUID parentJobId);
  
  List<MessageTask> findByAdminIdAndParentJobIdOrderBySendingStartTimeDescCreatedAtDesc(String adminId, UUID parentJobId);

  Page<MessageTask> findBySendingStatusAndParentJobId(SendingStatus sendingStatus, UUID parentJobId, Pageable pageable);
  
  @Query("SELECT mt FROM MessageTask mt WHERE LOWER(mt.recipientEmail) IN :recipientEmailsLowerCased AND mt.sendingStartTime >= :fromTime AND " +
         "mt.sendingResult.delieveryFailed = false AND mt.parentJob.messageType IN :parentJobMessageTypes ORDER BY mt.sendingStartTime ASC")
  List<MessageTask> findNonFailedByRecipientsAndParentJobTypeStartingFrom(@Param("recipientEmailsLowerCased") Collection<String> recipientEmailsLowerCased, 
                                                                          @Param("fromTime") LocalDateTime fromTime,
                                                                          @Param("parentJobMessageTypes") Collection<MessageType> parentJobMessageTypes);

  @Modifying
  @Query("UPDATE MessageTask mt SET mt.sendingStatus = 'SENDING_FINISHED', mt.sendingResult.delieveryFailed = true, mt.sendingResult.failureType = :failureType, mt.sendingResult.failureMessage = :failureMessage, " +
         "mt.sendingResult.delieveryFailedDate = NOW(), mt.sendingEndTime = NOW() " +
         "WHERE mt.parentJobId = :parentJobId  AND mt.adminId = :adminId")
  int updateDeliveryFailedByMessageJobId(@Param("parentJobId") UUID parentJobId,
                                         @Param("adminId") String adminId,
                                         @Param("failureType") FailureType failureType, 
                                         @Param("failureMessage") String failureMessage);

  
  MessageTask findByMessageReplyToAndRecipientEmailAndParentJobMessageTypeAndAdminId(String senderEmail, 
                                                                                     String recipientEmail, 
                                                                                     MessageType messageType, 
                                                                                     String adminId);  
  
  long countByAdminIdAndParentJobIdAndSendingResultDelieveryFailed(String adminId, UUID parentJobId, boolean delieveryFailed);

  List<MessageTask> findBySendingStatusAndModifiedAtBeforeOrderByModifiedAtAscParentJobId(SendingStatus sendingStatus, LocalDateTime lastModifiedDateBefore);
  
}
