package org.runningdinner.dinnerroute.optimization;

import org.runningdinner.common.ResourceLoader;
import org.runningdinner.dinnerroute.optimization.data.OptimizationDataProvider;
import org.runningdinner.dinnerroute.optimization.lock.OptimizationInstanceStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.io.InputStream;

public class TestOptimizationDataProvider implements OptimizationDataProvider {

	private static final Logger LOGGER = LoggerFactory.getLogger(TestOptimizationDataProvider.class);

	private String requestData;

	@Override
	public String readResponseData(String adminId, String optimizationId) {
		// Load the request template from resources and replace placeholders with actual values
		Resource resource = ResourceLoader.getResource("optimization/request-template.json");

		String responseData;
		try (InputStream inputStream = resource.getInputStream()) {
			responseData = new String(inputStream.readAllBytes());
		} catch (IOException e) {
			throw new RuntimeException(e);
		}

		responseData = responseData.replaceAll("__ADMIN_ID__", adminId);
		responseData = responseData.replaceAll("__OPTIMIZATION_ID__", optimizationId);
		return responseData;
	}

	@Override
	public void writeRequestData(String adminId, String optimizationId, String requestJsonString) throws TooManyOptimizationRequestsException {
		this.requestData = requestJsonString;
	}

	@Override
	public void setOptimizationFinished(String adminId, String optimizationId, OptimizationInstanceStatus status) {
		LOGGER.info("Optimization finished for adminId: {}, optimizationId: {}, status: {}", adminId, optimizationId, status);
	}

	public String getRequestData() {
		return requestData;
	}
}
