package org.runningdinner.dinnerroute.optimization.notification;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.common.aws.SnsMessage;
import org.runningdinner.common.aws.SnsMessageMapperService;
import org.runningdinner.common.aws.SnsUtil;
import org.runningdinner.common.aws.WebhookValidatorService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/rest/sse/v1/dinnerroute/optimization")
public class DinnerRouteOptimizationNotificationRestController {

	private static final long TIMEOUT = 180 * 1000L; // 3 Minutes
	private static final Logger LOGGER = LoggerFactory.getLogger(DinnerRouteOptimizationNotificationRestController.class);

	private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

	private final WebhookValidatorService webhookValidatorService;

	private final DinnerRouteOptimizationNotificationService dinnerRouteOptimizationNotificationService;

	private final SnsMessageMapperService snsMessageMapperService;

	public DinnerRouteOptimizationNotificationRestController(WebhookValidatorService webhookValidatorService,
																													 DinnerRouteOptimizationNotificationService dinnerRouteOptimizationNotificationService,
																													 SnsMessageMapperService snsMessageMapperService) {
		this.webhookValidatorService = webhookValidatorService;
		this.dinnerRouteOptimizationNotificationService = dinnerRouteOptimizationNotificationService;
		this.snsMessageMapperService = snsMessageMapperService;
	}

	@GetMapping(value = "/runningdinner/{adminId}/{optimizationId}/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
	public SseEmitter subscribe(@PathVariable String adminId, @PathVariable String optimizationId) {
		SseEmitter emitter = new SseEmitter(TIMEOUT); // no timeout
		String emitterKey = emitterKey(adminId, optimizationId);
		emitters.put(emitterKey, emitter);
		LOGGER.info("SseEmitter for adminId {} and optimizationId {} created", adminId, optimizationId);

		emitter.onCompletion(() -> {
			LOGGER.info("SseEmitter for adminId {} and optimizationId {} completed", adminId, optimizationId);
			emitters.remove(emitterKey);
		});
		emitter.onError((Throwable e) -> {
			LOGGER.error("SseEmitter for adminId {} and optimizationId {} encountered an error", adminId, optimizationId, e);
			emitters.remove(emitterKey);
		});
		emitter.onTimeout(() -> {
			LOGGER.info("SseEmitter for adminId {} and optimizationId {} timed out", adminId, optimizationId);
			emitters.remove(emitterKey);
		});

		return emitter;
	}

	// Called by SNS (via Lambda or direct HTTP) when optimization is finished (SNS only supports text/plain when sending requests)
	@PostMapping(value = "/notify", consumes = { MediaType.TEXT_PLAIN_VALUE, MediaType.APPLICATION_JSON_VALUE })
	public ResponseEntity<Object> notifyOptimizationFinished(@RequestBody String jsonPayload,
																													 @RequestParam(value="webhookToken", required = false) String webhookToken) {

		LOGGER.info("Received route optimization notification message with token {} and message: {} ...",
						StringUtils.substring(webhookToken, 0, 2), StringUtils.substring(jsonPayload, 0, 128));

		if (!webhookValidatorService.isWebhookTokenValid(webhookToken)) {
			LOGGER.warn("Invalid Webhook token. Ignoring. Message was {}", StringUtils.substring(jsonPayload, 0, 128));
			return ResponseEntity.status(403).body("Invalid token");
		}

		SnsMessage snsMessage = snsMessageMapperService.mapToMessageWithAutoConfirm(jsonPayload);
		if (!SnsUtil.isNotificationWithPayload(snsMessage)) {
			LOGGER.warn("Unknown SNS message type: {} for {}", snsMessage.getType(), snsMessage.getTopicArn());
			return ResponseEntity.ok().build();
		}

		OptimizationFinishedEvent optimizationFinishedEvent = dinnerRouteOptimizationNotificationService.mapOptimizedFinishedEventFromJson(snsMessage.getMessage());

		String emitterKey = emitterKey(optimizationFinishedEvent.getAdminId(), optimizationFinishedEvent.getOptimizationId());
		SseEmitter emitter = emitters.get(emitterKey);
		if (emitter != null) {
			try {
				String resultJsonPayload = dinnerRouteOptimizationNotificationService.mapOptimizedFinishedEventToJson(optimizationFinishedEvent);
				dinnerRouteOptimizationNotificationService.markOptimizationFinishedEventAsProcessed(optimizationFinishedEvent);
				emitter.send(SseEmitter.event().data(resultJsonPayload));
				emitter.complete();
			} catch (IOException e) {
				LOGGER.error("Error while sending SSE event for adminId {} and optimizationId {}", optimizationFinishedEvent.getAdminId(), optimizationFinishedEvent.getOptimizationId(), e);
				emitter.completeWithError(e);
			} finally {
				emitters.remove(emitterKey);
			}
		}
		return ResponseEntity.ok().build();
	}

	private static String emitterKey(String adminId, String optimizationId) {
		return adminId + "_" + optimizationId;
	}
}
