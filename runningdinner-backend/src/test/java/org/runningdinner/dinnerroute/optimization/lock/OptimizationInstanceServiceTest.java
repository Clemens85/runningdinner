package org.runningdinner.dinnerroute.optimization.lock;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.test.util.ApplicationTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@ApplicationTest
public class OptimizationInstanceServiceTest {

	@Autowired
	private OptimizationInstanceService optimizationInstanceService;

	@Test
	public void mapInstanceToJsonAndAddMetadataEntry() {

		LocalDateTime createdAt = LocalDateTime.of(2025, 7, 31, 9, 0, 0);
		Map<String, String> metadata = new HashMap<>();

		OptimizationInstance optimizationInstance = new OptimizationInstance("optimizationId", createdAt, OptimizationInstanceStatus.RUNNING);
		optimizationInstanceService.mapInstanceToJsonAndAddMetadataEntry(optimizationInstance, metadata);

		assertThat(metadata).isNotEmpty();
		String expectedKey = "optimization-request-2025-07-31_09-00-00";
		assertThat(metadata).containsKey(expectedKey);
		String expectedValue = """
				{"optimizationId":"optimizationId","createdAt":"2025-07-31_09-00-00","status":"RUNNING"}
				""";
		assertThat(metadata.get(expectedKey)).isEqualTo(expectedValue.trim());
	}

	@Test
	public void mapMetadataToInstances() {

		// Note: The logic should recognize that this RUNNING instance is older than the timeout and thus should be treated as TIMEOUT
		String payloadWithTimeout = """
				{"optimizationId":"1","createdAt":"2025-07-31_09-00-00","status":"RUNNING"}
			""".trim();

		LocalDateTime now = LocalDateTime.now().plusSeconds(10); // This should be way enough for not being recognized as timeout
		String nowFormatted = OptimizationInstance.DATE_TINE_FORMAT.format(now);
		String payloadRunningKey = "optimization-request-%s".formatted(nowFormatted);
		String payloadRunning = """
				{"optimizationId":"2","createdAt":"%s","status":"RUNNING"}
			""".formatted(nowFormatted).trim();

		Map<String, String> metadata = Map.of(
			"foo", "bar",
			"optimization-request-2025-07-31_09-00-00", payloadWithTimeout,
					payloadRunningKey, payloadRunning
		);

		var instances = optimizationInstanceService.mapMetadataToInstances(metadata);
		assertThat(instances).hasSize(2);
		OptimizationInstance runningInstance = instances.getFirst();
		assertThat(runningInstance.getOptimizationId()).isEqualTo("2");
		assertThat(runningInstance.getStatus()).isEqualTo(OptimizationInstanceStatus.RUNNING);
		assertThat(runningInstance.getCreatedAt()).isEqualToIgnoringNanos(now);

		OptimizationInstance timeoutInstance = instances.getLast();
		assertThat(timeoutInstance.getOptimizationId()).isEqualTo("1");
		assertThat(timeoutInstance.getStatus()).isEqualTo(OptimizationInstanceStatus.TIMEOUT);
		assertThat(timeoutInstance.getCreatedAt()).isEqualTo(LocalDateTime.of(2025, 7, 31, 9, 0, 0));
	}

}
