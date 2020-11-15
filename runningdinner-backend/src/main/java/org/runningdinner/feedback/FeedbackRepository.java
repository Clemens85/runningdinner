package org.runningdinner.feedback;

import java.util.List;
import java.util.UUID;

import org.runningdinner.feedback.Feedback.DeliveryState;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {

  List<Feedback> findByDeliveryState(DeliveryState deliveryState, Sort sort); 

}
