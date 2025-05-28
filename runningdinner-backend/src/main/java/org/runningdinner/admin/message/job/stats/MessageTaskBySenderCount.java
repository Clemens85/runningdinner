package org.runningdinner.admin.message.job.stats;

import java.time.LocalDateTime;

public class MessageTaskBySenderCount {
	
	private long count;
	
	private String sender;
	
	private LocalDateTime sendingStartTime;

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
