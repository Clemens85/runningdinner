package org.runningdinner.admin.message.job.stats;

import java.time.LocalDateTime;

public class MessageTaskBySenderCount {
	
	private final long count;
	
	private final String sender;
	
	private final LocalDateTime sendingStartTime;

	public MessageTaskBySenderCount(long count, String sender, LocalDateTime sendingStartTime) {
		this.count = count;
		this.sender = sender;
		this.sendingStartTime = sendingStartTime;
	}

	public long getCount() {
		return count;
	}

	public String getSender() {
		return sender;
	}

	public LocalDateTime getSendingStartTime() {
		return sendingStartTime;
	}

	
}
