package org.runningdinner.dinnerroute.optimization.data;

import org.runningdinner.dinnerroute.optimization.TooManyOptimizationRequestsException;
import org.runningdinner.dinnerroute.optimization.lock.OptimizationInstanceStatus;

public interface OptimizationDataProvider {

	String readResponseData(String adminId, String optimizationId);

	boolean hasResponseData(String adminId, String optimizationId);

	void writeRequestData(String adminId, String optimizationId, String requestJsonString) throws TooManyOptimizationRequestsException;

	void setOptimizationFinished(String adminId, String optimizationId, OptimizationInstanceStatus status);
}
