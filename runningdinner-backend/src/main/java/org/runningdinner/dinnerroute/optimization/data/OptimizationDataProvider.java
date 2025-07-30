package org.runningdinner.dinnerroute.optimization.data;

import org.runningdinner.dinnerroute.optimization.TooManyOptimizationRequestsException;

public interface OptimizationDataProvider {

	String readResponseData(String adminId, String optimizationId);

	void writeRequestData(String adminId, String optimizationId, String requestJsonString) throws TooManyOptimizationRequestsException;
}
