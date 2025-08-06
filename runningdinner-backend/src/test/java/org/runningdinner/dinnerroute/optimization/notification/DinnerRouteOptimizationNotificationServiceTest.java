package org.runningdinner.dinnerroute.optimization.notification;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.test.util.ApplicationTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@ApplicationTest
public class DinnerRouteOptimizationNotificationServiceTest {

	@Autowired
	private DinnerRouteOptimizationNotificationService dinnerRouteOptimizationNotificationService;

	@Test
	public void mapOptimizedFinishedEventFromJson() {

		String payload = """
						{
							"adminId": "admin123",
							"optimizationId": "opt456"
						}
					""";

		OptimizationFinishedEvent result = dinnerRouteOptimizationNotificationService.mapOptimizedFinishedEventFromJson(payload);
		assertThat(result.getAdminId()).isEqualTo("admin123");
		assertThat(result.getOptimizationId()).isEqualTo("opt456");

		payload = """
						{
							"adminId": "admin123",
							"optimizationId": "opt456",
							"errorMessage": "An error occurred during optimization"
						}
					""";

		result = dinnerRouteOptimizationNotificationService.mapOptimizedFinishedEventFromJson(payload);
		assertThat(result.getAdminId()).isEqualTo("admin123");
		assertThat(result.getOptimizationId()).isEqualTo("opt456");
		assertThat(result.getErrorMessage()).isEqualTo("An error occurred during optimization");
	}

}
