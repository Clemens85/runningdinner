package org.runningdinner.feedback;

import org.runningdinner.feedback.Feedback.DeliveryState;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {

  List<Feedback> findByDeliveryState(DeliveryState deliveryState, Sort sort);

  Page<Feedback> findAllBySenderIpNot(String senderIp, Pageable pageable);

  boolean existsByThreadId(UUID threadId);

}
