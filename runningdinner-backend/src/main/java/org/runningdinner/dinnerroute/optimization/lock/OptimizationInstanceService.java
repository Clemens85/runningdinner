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
import java.util.*;

@Service
public class OptimizationInstanceService {

	private static final Logger LOGGER = LoggerFactory.getLogger(OptimizationInstanceService.class);

	private final int maxRunningTimeBeforeTimeoutSeconds;
	private final ObjectMapper objectMapper;
	private final String bucketName;
	private final S3Client s3Client;

	public OptimizationInstanceService(@Value("${max.running.TODO:120}") int maxRunningTimeBeforeTimeoutSeconds, // TODO
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

		PutObjectRequest putObjectRequest = PutObjectRequest
						.builder()
						.bucket(bucketName)
						.key(key)
						.metadata(metadata)
						.contentType(MediaType.APPLICATION_JSON_VALUE)
						.build();

		s3Client.putObject(putObjectRequest, RequestBody.empty());
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

	private void mapInstanceToJsonAndAddMetadataEntry(OptimizationInstance existingInstance, Map<String, String> metadata)  {
		try {
			String instanceAsJsonStr = objectMapper.writeValueAsString(existingInstance);
			String createdAtFormatted = OptimizationInstance.DATE_TINE_FORMAT.format(existingInstance.getCreatedAt());
			String metadataKey = String.format("%s%s", OptimizationInstance.REQUEST_FILE_PREFIX, createdAtFormatted);
			metadata.put(metadataKey, instanceAsJsonStr);
		} catch (JsonProcessingException e) {
			LOGGER.error("Error while mapping OptimizationInstance to JSON: {}. Instance will be ignored", existingInstance, e);
		}
	}

	private List<OptimizationInstance> mapMetadataToInstances(Map<String, String> metadata) {
		List<OptimizationInstance> result = new ArrayList<>();

		if (metadata == null || metadata.isEmpty()) {
			return Collections.emptyList();
		}
		for (String key : metadata.keySet()) {
			if (!StringUtils.startsWith(OptimizationInstance.REQUEST_FILE_PREFIX, key)) {
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
			if (instance.getStatus() != OptimizationInstanceStatus.RUNNING || instance.getCreatedAt() == null) {
				result.add(instance);
			}
			if (instance.getCreatedAt().plusSeconds(maxRunningTimeBeforeTimeoutSeconds).isBefore(now)) {
				LOGGER.warn("Setting optimization instance {} to TIMEOUT due to it exceeded max running time of {} seconds", instance, maxRunningTimeBeforeTimeoutSeconds);
				result.add(new OptimizationInstance(instance.getOptimizationId(), instance.getCreatedAt(), OptimizationInstanceStatus.TIMEOUT));
			}
		}
		result.sort(Comparator.comparing(OptimizationInstance::getCreatedAt).reversed());
		return result;
	}

	private void createInitialLockFile(String lockFileKey) {

		Map<String, String> metadata = new HashMap<>();

		PutObjectRequest putObjectRequest = PutObjectRequest
						.builder()
						.bucket(bucketName)
						.key(lockFileKey)
						.metadata(metadata)
						.contentType(MediaType.APPLICATION_JSON_VALUE)
						.build();

		s3Client.putObject(putObjectRequest, RequestBody.empty());
	}
}
