package org.runningdinner.feedback;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FeedbackConversationRepository extends JpaRepository<FeedbackConversation, UUID> {

}
