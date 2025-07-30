package org.runningdinner.dinnerroute.optimization.data;

import org.runningdinner.common.aws.S3ClientProviderService;
import org.runningdinner.dinnerroute.optimization.TooManyOptimizationRequestsException;
import org.runningdinner.dinnerroute.optimization.lock.OptimizationInstance;
import org.runningdinner.dinnerroute.optimization.lock.OptimizationInstanceService;
import org.runningdinner.dinnerroute.optimization.lock.OptimizationInstanceStatus;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Profile("!dev")
public class OptimizationDataProviderS3 implements OptimizationDataProvider {

	private final OptimizationInstanceService optimizationInstanceService;
	private final String bucketName;
	private final S3Client s3Client;

	public OptimizationDataProviderS3(OptimizationInstanceService optimizationInstanceService,
																		S3ClientProviderService s3ClientProviderService) {
		this.optimizationInstanceService = optimizationInstanceService;
		this.bucketName = s3ClientProviderService.getApplicationBucket();
		this.s3Client = s3ClientProviderService.getS3Client();
	}

	public String readResponseData(String adminId, String optimizationId) {
		String key = OptimizationDataUtil.buildResponseFilePath(adminId, optimizationId);
		GetObjectRequest getObjectRequest = GetObjectRequest.builder()
																					.bucket(bucketName)
																					.key(key)
																					.build();

		try (var inputStream = s3Client.getObject(getObjectRequest)) {
			return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
		} catch (IOException e) {
			String errorMsg = "Failed to read from %s/%s for adminId %s and optimizationId %s".formatted(bucketName, key, adminId, optimizationId);
			throw new RuntimeException(errorMsg, e);
		}
	}

	public void writeRequestData(String adminId, String optimizationId, String requestJsonString) throws TooManyOptimizationRequestsException {
		List<OptimizationInstance> existingRequests = optimizationInstanceService.getOptimizationRequestInstances(adminId);
		if (isExceedingMaxRunningInstances(existingRequests)) {
			throw new TooManyOptimizationRequestsException("Cannot write request data: More than one optimization request is already running for adminId: " + adminId);
		}

		String key = OptimizationDataUtil.buildRequestFilePath(adminId, optimizationId);

		Map<String, String> metadata = new HashMap<>();

		PutObjectRequest putObjectRequest = PutObjectRequest
																					.builder()
																					.bucket(bucketName)
																					.key(key)
																					.metadata(metadata)
																					.contentType(MediaType.APPLICATION_JSON_VALUE)
																					.build();

		optimizationInstanceService.addRequestInstanceToLockFile(adminId, optimizationId, existingRequests);
		s3Client.putObject(putObjectRequest, RequestBody.fromString(requestJsonString));
	}

	private boolean isExceedingMaxRunningInstances(List<OptimizationInstance> instances) {
		long runningInstances = instances
															.stream()
															.filter(i -> i.getStatus() == OptimizationInstanceStatus.RUNNING)
															.count();
		return runningInstances >= 2;
	}

}
