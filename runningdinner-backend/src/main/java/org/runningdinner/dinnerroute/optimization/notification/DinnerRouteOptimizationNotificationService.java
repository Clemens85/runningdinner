package org.runningdinner.dinnerroute.optimization.notification;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.runningdinner.dinnerroute.optimization.DinnerRouteOptimizationService;
import org.springframework.stereotype.Component;

@Component
public class DinnerRouteOptimizationNotificationService {

	private final ObjectMapper objectMapper;
	private final DinnerRouteOptimizationService dinnerRouteOptimizationService;

	public DinnerRouteOptimizationNotificationService(ObjectMapper objectMapper, DinnerRouteOptimizationService dinnerRouteOptimizationService) {
		this.objectMapper = objectMapper;
		this.dinnerRouteOptimizationService = dinnerRouteOptimizationService;
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

}
