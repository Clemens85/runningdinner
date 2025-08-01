package org.runningdinner.dinnerroute.optimization.lock;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.common.aws.S3ClientProviderService;
import org.runningdinner.dinnerroute.optimization.data.OptimizationDataUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OptimizationInstanceService {

	private static final Logger LOGGER = LoggerFactory.getLogger(OptimizationInstanceService.class);

	private final int maxRunningTimeBeforeTimeoutSeconds;
	private final ObjectMapper objectMapper;
	private final String bucketName;
	private final S3Client s3Client;

	public OptimizationInstanceService(@Value("${route.optimization.instance.timeout.seconds}") int maxRunningTimeBeforeTimeoutSeconds,
																		 S3ClientProviderService s3ClientProviderService,
																		 ObjectMapper objectMapper) {
		this.maxRunningTimeBeforeTimeoutSeconds = maxRunningTimeBeforeTimeoutSeconds;
		this.objectMapper = objectMapper;
		this.bucketName = s3ClientProviderService.getApplicationBucket();
		this.s3Client = s3ClientProviderService.getS3Client();
	}

	public void addRequestInstanceToLockFile(String adminId, String optimizationId, List<OptimizationInstance> existingInstances) {
		String key = OptimizationDataUtil.buildLockFilePath(adminId);

		Map<String, String> metadata = new HashMap<>();
		for (var existingInstance : existingInstances) {
			mapInstanceToJsonAndAddMetadataEntry(existingInstance, metadata);
		}
		mapInstanceToJsonAndAddMetadataEntry(new OptimizationInstance(optimizationId, LocalDateTime.now(), OptimizationInstanceStatus.RUNNING), metadata);

		performPutObject(key, metadata);
	}

	public List<OptimizationInstance> getOptimizationRequestInstances(String adminId) {
		String key = OptimizationDataUtil.buildLockFilePath(adminId);
		try {
			// Fetch the metadata for the lock file using a HeadObjectRequest
			HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
							.bucket(bucketName) // Replace with your actual bucket name
							.key(key)
							.build();
			var response = s3Client.headObject(headObjectRequest);
			return mapMetadataToInstances(response.metadata());
		} catch (NoSuchKeyException e) {
			// If the lock file does not exist, it means no optimization is running
			createInitialLockFile(key);
			return Collections.emptyList();
		}
	}

	public void setOptimizationFinished(String adminId, String optimizationId, OptimizationInstanceStatus status) {
		String key = OptimizationDataUtil.buildLockFilePath(adminId);

		List<OptimizationInstance> existingInstances = getOptimizationRequestInstances(adminId);
		OptimizationInstance foundInstance = existingInstances
																					.stream()
																					.filter(instance -> StringUtils.equals(instance.getOptimizationId(), optimizationId))
																					.findFirst()
																					.orElse(null);

		if (foundInstance == null) {
			LOGGER.error("No existing optimization instance found for adminId {} and optimizationId {}. Cannot set status to {}", adminId, optimizationId, status);
			return;
		}

		foundInstance.setStatus(status);

		List<OptimizationInstance> resultingInstances = new ArrayList<>(
			existingInstances.stream().filter(instance -> !instance.equals(foundInstance)).toList()
		);
		resultingInstances.add(foundInstance);

		Map<String, String> metadata = new HashMap<>();
		resultingInstances.forEach(instance -> mapInstanceToJsonAndAddMetadataEntry(instance, metadata));

		performPutObject(key, metadata);
	}

	protected void mapInstanceToJsonAndAddMetadataEntry(OptimizationInstance optimizationInstance, Map<String, String> metadata)  {
		try {
			String instanceAsJsonStr = objectMapper.writeValueAsString(optimizationInstance);
			String createdAtFormatted = OptimizationInstance.DATE_TINE_FORMAT.format(optimizationInstance.getCreatedAt());
			String metadataKey = String.format("%s%s", OptimizationInstance.REQUEST_FILE_PREFIX, createdAtFormatted);
			metadata.put(metadataKey, instanceAsJsonStr);
		} catch (JsonProcessingException e) {
			LOGGER.error("Error while mapping OptimizationInstance to JSON: {}. Instance will be ignored", optimizationInstance, e);
		}
	}

	protected List<OptimizationInstance> mapMetadataToInstances(Map<String, String> metadata) {
		List<OptimizationInstance> result = new ArrayList<>();

		if (metadata == null || metadata.isEmpty()) {
			return Collections.emptyList();
		}
		for (String key : metadata.keySet()) {
			if (!StringUtils.startsWith(key, OptimizationInstance.REQUEST_FILE_PREFIX)) {
				continue;
			}
			String value = metadata.get(key);
			if (StringUtils.isEmpty(value)) {
				continue;
			}

			try {
				OptimizationInstance instance = objectMapper.readValue(value, OptimizationInstance.class);
				result.add(instance);
			} catch (JsonProcessingException e) {
				LOGGER.error("Error while parsing metadata value to OptimizationInstance: {}. Value will be ignored", value, e);
			}
		}
		return postProcessInstances(result);
	}

	private List<OptimizationInstance> postProcessInstances(List<OptimizationInstance> instances) {
		var now = LocalDateTime.now();
		List<OptimizationInstance> result = new ArrayList<>();
		for (var instance : instances) {
			if (hasRunningInstanceTimeout(instance, now)) {
				LOGGER.warn("Setting optimization instance {} to TIMEOUT due to it exceeded max running time of {} seconds", instance, maxRunningTimeBeforeTimeoutSeconds);
				result.add(new OptimizationInstance(instance.getOptimizationId(), instance.getCreatedAt(), OptimizationInstanceStatus.TIMEOUT));
				continue;
			}
			result.add(instance);
		}
		result.sort(Comparator.comparing(OptimizationInstance::getCreatedAt).reversed());
		return result;
	}

	private boolean hasRunningInstanceTimeout(OptimizationInstance instance, LocalDateTime now) {
		if (instance.getCreatedAt() == null) {
			return false;
		}
		return instance.getStatus() == OptimizationInstanceStatus.RUNNING &&
					 instance.getCreatedAt().plusSeconds(maxRunningTimeBeforeTimeoutSeconds).isBefore(now);
	}

	private void createInitialLockFile(String lockFileKey) {
		performPutObject(lockFileKey, Collections.emptyMap());
	}

	private void performPutObject(String key, Map<String, String> metadata) {
		PutObjectRequest putObjectRequest = PutObjectRequest
						.builder()
						.bucket(bucketName)
						.key(key)
						.metadata(metadata)
						.contentType(MediaType.APPLICATION_JSON_VALUE)
						.build();

		s3Client.putObject(putObjectRequest, RequestBody.empty());
	}
}
