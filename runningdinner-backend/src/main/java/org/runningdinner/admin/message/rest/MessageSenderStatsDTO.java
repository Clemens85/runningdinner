package org.runningdinner.admin.message.rest;

public record MessageSenderStatsDTO(String senderKey, int priority, boolean fallback, int dailyLimit, int monthlyLimit, int dailyUsage, int monthlyUsage) {

}
