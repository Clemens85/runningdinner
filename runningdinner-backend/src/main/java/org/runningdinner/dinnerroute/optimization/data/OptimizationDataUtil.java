package org.runningdinner.dinnerroute.optimization.data;

public final class OptimizationDataUtil {

	public static String buildLockFilePath(String adminId) {
		return String.format("optimization/%s/lock.json", adminId);
	}

	public static String buildRequestFilePath(String adminId, String optimizationId) {
		return String.format("optimization/%s/%s-request.json", adminId, optimizationId);
	}

	public static String buildResponseFilePath(String adminId, String optimizationId) {
		return String.format("optimization/%s/%s-response.json", adminId, optimizationId);
	}
}
