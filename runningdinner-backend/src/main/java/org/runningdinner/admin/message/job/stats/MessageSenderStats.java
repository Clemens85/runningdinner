package org.runningdinner.admin.message.job.stats;

import java.util.Map;

public class MessageSenderStats {

	private final Map<String, Integer> sentTasksOfDay;
	
	private final Map<String, Integer> sentTasksOfMonth;

	public MessageSenderStats(Map<String, Integer> sentTasksOfDay, Map<String, Integer> sentTasksOfMonth) {
		super();
		this.sentTasksOfDay = sentTasksOfDay;
		this.sentTasksOfMonth = sentTasksOfMonth;
	}

	public Map<String, Integer> getSentTasksOfDay() {
		return sentTasksOfDay;
	}

	public Map<String, Integer> getSentTasksOfMonth() {
		return sentTasksOfMonth;
	}

	public int getSentTasksOfMonth(String key) {
		return sentTasksOfMonth.getOrDefault(key, 0);
	}

	public int getSentTasksOfDay(String key) {
		return sentTasksOfDay.getOrDefault(key, 0);
	}
	
	
}
