package org.runningdinner.admin.message.job.stats;

import java.time.LocalDateTime;

public interface MessageTaskSenderInfo {

	String getSender();

	LocalDateTime getSendingStartTime();
}
