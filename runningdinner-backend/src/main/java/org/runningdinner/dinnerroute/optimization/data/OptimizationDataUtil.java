package org.runningdinner.dinnerroute.optimization.data;

public final class OptimizationDataUtil {

	public static String buildLockFilePath(String adminId) {
		return String.format("%s/optimization/lock.json", adminId);
	}

	public static String buildRequestFilePath(String adminId, String optimizationId) {
		return String.format("%s/optimization/request-%s.json", adminId, optimizationId);
	}

	public static String buildResponseFilePath(String adminId, String optimizationId) {
		return String.format("%s/optimization/response-%s.json", adminId, optimizationId);
	}
}
