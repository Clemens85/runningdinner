package org.runningdinner.feedback;

import com.google.common.base.MoreObjects;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.SafeHtml;
import org.runningdinner.core.AbstractEntity;

import java.util.UUID;

@Entity
public class FeedbackConversation extends AbstractEntity {

	@NotBlank
	@SafeHtml
	@Size(max = 4096, message = "error.message.max.size")
	private final String message;

	@NotNull
	@Enumerated(EnumType.STRING)
	private final ConversationRole role;

	@NotNull
	private final UUID threadId;

	public FeedbackConversation(String message, ConversationRole role, UUID threadId) {
		this.message = message;
		this.role = role;
		this.threadId = threadId;
	}

	public String getMessage() {
		return message;
	}

	public ConversationRole getRole() {
		return role;
	}

	public UUID getThreadId() {
		return threadId;
	}

	@Override
	public String toString() {
		return MoreObjects.toStringHelper(this)
						.add("message", message)
						.add("role", role)
						.add("threadId", threadId)
						.toString();
	}
}
