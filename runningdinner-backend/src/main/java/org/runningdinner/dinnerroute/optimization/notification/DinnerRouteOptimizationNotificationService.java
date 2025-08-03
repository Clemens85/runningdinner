package org.runningdinner.dinnerroute.optimization.notification;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.runningdinner.dinnerroute.optimization.data.OptimizationDataProvider;
import org.runningdinner.dinnerroute.optimization.lock.OptimizationInstanceStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class DinnerRouteOptimizationNotificationService {

	private static final Logger LOGGER = LoggerFactory.getLogger(DinnerRouteOptimizationNotificationService.class);

	private final ObjectMapper objectMapper;
	private final OptimizationDataProvider optimizationDataProvider;

	public DinnerRouteOptimizationNotificationService(ObjectMapper objectMapper,
																										OptimizationDataProvider optimizationDataProvider) {
		this.objectMapper = objectMapper;
		this.optimizationDataProvider = optimizationDataProvider;
	}

	public OptimizationFinishedEvent mapOptimizedFinishedEventFromJson(String payload) {
		try {
			return objectMapper.readValue(payload, OptimizationFinishedEvent.class);
		} catch (JsonProcessingException e) {
			throw new RuntimeException(e);
		}
	}

	public String mapOptimizedFinishedEventToJson(OptimizationFinishedEvent evt) {
		try {
			return objectMapper.writeValueAsString(evt);
		} catch (JsonProcessingException e) {
			throw new RuntimeException(e);
		}
	}

	public void markOptimizationFinishedEventAsProcessed(OptimizationFinishedEvent optimizationFinishedEvent) {
		try {
			this.optimizationDataProvider.setOptimizationFinished(optimizationFinishedEvent.getAdminId(), optimizationFinishedEvent.getOptimizationId(), OptimizationInstanceStatus.FINISHED);
		} catch (Exception e) {
			LOGGER.error("Failed to mark optimization finished for adminId {} and optimizationId {}",
										optimizationFinishedEvent.getAdminId(), optimizationFinishedEvent.getOptimizationId(), e);
		}
	}
}
