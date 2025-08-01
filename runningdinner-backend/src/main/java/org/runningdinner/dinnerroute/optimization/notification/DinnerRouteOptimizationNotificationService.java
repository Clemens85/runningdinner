package org.runningdinner.dinnerroute.optimization.notification;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.dinnerroute.optimization.DinnerRouteOptimizationService;
import org.runningdinner.dinnerroute.optimization.data.OptimizationDataProvider;
import org.runningdinner.dinnerroute.optimization.lock.OptimizationInstanceStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class DinnerRouteOptimizationNotificationService {

	private static final Logger LOGGER = LoggerFactory.getLogger(DinnerRouteOptimizationNotificationService.class);

	private final ObjectMapper objectMapper;
	private final DinnerRouteOptimizationService dinnerRouteOptimizationService;
	private final OptimizationDataProvider optimizationDataProvider;

	public DinnerRouteOptimizationNotificationService(ObjectMapper objectMapper,
																										DinnerRouteOptimizationService dinnerRouteOptimizationService,
																										OptimizationDataProvider optimizationDataProvider) {
		this.objectMapper = objectMapper;
		this.dinnerRouteOptimizationService = dinnerRouteOptimizationService;
		this.optimizationDataProvider = optimizationDataProvider;
	}

	public OptimizationFinishedEvent mapOptimizedFinishedEventFromJson(String payload) {
		try {
			return objectMapper.readValue(payload, OptimizationFinishedEvent.class);
		} catch (JsonProcessingException e) {
			throw new RuntimeException(e);
		}
	}

	public String findOptimizedDinnerRoutesPreviewAsJson(OptimizationFinishedEvent evt) throws JsonProcessingException {
		var optimizationResponse = dinnerRouteOptimizationService.previewOptimizedDinnerRoutes(evt.getAdminId(), evt.getOptimizationId());
		return objectMapper.writeValueAsString(optimizationResponse);
	}

	public void markOptimizationFinishedEventAsProcessed(OptimizationFinishedEvent optimizationFinishedEvent) {
		try {
			OptimizationInstanceStatus status = StringUtils.isBlank(optimizationFinishedEvent.getErrorMessage()) ?
							OptimizationInstanceStatus.SUCCEEDED : OptimizationInstanceStatus.FAILED;
			this.optimizationDataProvider.setOptimizationFinished(optimizationFinishedEvent.getAdminId(), optimizationFinishedEvent.getOptimizationId(), status);
		} catch (Exception e) {
			LOGGER.error("Failed to mark optimization finished for adminId {} and optimizationId {}",
										optimizationFinishedEvent.getAdminId(), optimizationFinishedEvent.getOptimizationId(), e);
		}
	}
}
