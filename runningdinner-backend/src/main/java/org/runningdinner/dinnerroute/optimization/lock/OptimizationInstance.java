package org.runningdinner.dinnerroute.optimization.lock;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.base.MoreObjects;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

public class OptimizationInstance {

	private static final String DATE_TIME_FORMAT_PATTERN = "yyyy-MM-dd_HH-mm-ss";
	static final DateTimeFormatter DATE_TINE_FORMAT = DateTimeFormatter.ofPattern(DATE_TIME_FORMAT_PATTERN, Locale.ENGLISH);

	static final String REQUEST_FILE_PREFIX = "optimization-request-";

	@JsonProperty
	private String optimizationId;

	@JsonProperty
	@JsonFormat(pattern = DATE_TIME_FORMAT_PATTERN)
	private LocalDateTime createdAt;

	@JsonProperty
	private OptimizationInstanceStatus status;

	public OptimizationInstance(String optimizationId, LocalDateTime createdAt, OptimizationInstanceStatus status) {
		this.optimizationId = optimizationId;
		this.createdAt = createdAt;
		this.status = status;
	}

	protected OptimizationInstance() {
		// NOP
	}

	public static Map<String, String> mapToMetadata(List<OptimizationInstance> instances) {
		Map<String, String> result = new HashMap<>();
		for (var instance : instances) {
			String createdAtFormatted = DATE_TINE_FORMAT.format(instance.createdAt);
			String metadataKey = String.format("%s%s", REQUEST_FILE_PREFIX, createdAtFormatted);
			String metadataValue = """
						{
							"optimizationId": "%s",
							"status": "%s",
							"createdAt": "%s"
						}
						""".formatted(instance.getOptimizationId(), instance.getStatus(), createdAtFormatted);
			result.put(metadataKey, metadataValue);
		}
		return result;
	}

	public String getOptimizationId() {
		return optimizationId;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public OptimizationInstanceStatus getStatus() {
		return status;
	}

	public void setStatus(OptimizationInstanceStatus status) {
		this.status = status;
	}

	@Override
	public boolean equals(Object o) {
		if (o == null || getClass() != o.getClass()) {
			return false;
		}
		OptimizationInstance that = (OptimizationInstance) o;
		return Objects.equals(getOptimizationId(), that.getOptimizationId());
	}

	@Override
	public int hashCode() {
		return Objects.hashCode(getOptimizationId());
	}

	@Override
	public String toString() {
		return MoreObjects.toStringHelper(this)
						.add("optimizationId", optimizationId)
						.add("status", status)
						.toString();
	}
}
