package org.runningdinner.dinnerroute.optimization.data;

import org.runningdinner.common.aws.S3ClientProviderService;
import org.runningdinner.dinnerroute.optimization.TooManyOptimizationRequestsException;
import org.runningdinner.dinnerroute.optimization.lock.OptimizationInstance;
import org.runningdinner.dinnerroute.optimization.lock.OptimizationInstanceService;
import org.runningdinner.dinnerroute.optimization.lock.OptimizationInstanceStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Collections;
import java.util.List;

/**
 * Activate OptimizationDataProviderS3 always,
 * only deactivate it if route.optimization.dataprovider.s3.enabled is set explicitly to false.
 */
@Service
@ConditionalOnProperty(name = "route.optimization.dataprovider.s3.enabled", havingValue = "true", matchIfMissing = true)
public class OptimizationDataProviderS3 implements OptimizationDataProvider {

	private static final Logger LOGGER = LoggerFactory.getLogger(OptimizationDataProviderS3.class);

	private final OptimizationInstanceService optimizationInstanceService;
	private final String bucketName;
	private final S3ClientProviderService s3ClientProviderService;

	public OptimizationDataProviderS3(OptimizationInstanceService optimizationInstanceService,
																		S3ClientProviderService s3ClientProviderService) {
		this.optimizationInstanceService = optimizationInstanceService;
		this.bucketName = s3ClientProviderService.getRouteOptimizationBucket();
		this.s3ClientProviderService = s3ClientProviderService;
		LOGGER.info("Using S3-based OptimizationDataProvider with bucket: {}", bucketName);
	}

	public String readResponseData(String adminId, String optimizationId) {
		String key = OptimizationDataUtil.buildResponseFilePath(adminId, optimizationId);
		try {
			return s3ClientProviderService.readFileContentToString(bucketName, key);
		} catch (IOException e) {
			String errorMsg = "Failed to read from %s/%s for adminId %s and optimizationId %s".formatted(bucketName, key, adminId, optimizationId);
			throw new RuntimeException(errorMsg, e);
		}
	}

	@Override
	public boolean hasResponseData(String adminId, String optimizationId) {
		return s3ClientProviderService.isFileExisting(bucketName, OptimizationDataUtil.buildResponseFilePath(adminId, optimizationId));
	}

	public void writeRequestData(String adminId, String optimizationId, String requestJsonString) throws TooManyOptimizationRequestsException {
		List<OptimizationInstance> existingInstances = optimizationInstanceService.getOptimizationRequestInstances(adminId);
		// Set those instances to FINISHED which have a response file already existing...
		markInstancesFinishedForExistingResponseFiles(existingInstances, adminId);
		if (isExceedingMaxRunningInstances(existingInstances)) {
			throw new TooManyOptimizationRequestsException("Cannot write request data: More than one optimization request is already running for adminId: " + adminId);
		}
		// When writing metadata, our updated instances will be added to the lock file (-> thus we have an updated lock file calculated from existing response files)
		optimizationInstanceService.addRequestInstanceToLockFile(adminId, optimizationId, existingInstances);

		String key = OptimizationDataUtil.buildRequestFilePath(adminId, optimizationId);
		s3ClientProviderService.writeStringToFile(bucketName, key, requestJsonString, MediaType.APPLICATION_JSON_VALUE, Collections.emptyMap());
	}

	@Override
	public void setOptimizationFinished(String adminId, String optimizationId, OptimizationInstanceStatus status) {
		optimizationInstanceService.setOptimizationFinished(adminId, optimizationId, status);
	}

	private boolean isExceedingMaxRunningInstances(List<OptimizationInstance> instances) {
		long runningInstances = instances
															.stream()
															.filter(i -> i.getStatus() == OptimizationInstanceStatus.RUNNING)
															.count();
		return runningInstances >= 2;
	}


	private void markInstancesFinishedForExistingResponseFiles(List<OptimizationInstance> instances, String adminId) {
		var runningInstances = instances.stream().filter(r -> r.getStatus() == OptimizationInstanceStatus.RUNNING).toList();
		for (var runningInstance : runningInstances) {
			if (isResponseFileExisting(adminId, runningInstance)) {
				runningInstance.setStatus(OptimizationInstanceStatus.FINISHED);
			}
		}
	}

	private boolean isResponseFileExisting(String adminId, OptimizationInstance instance) {
		String optimizationId = instance.getOptimizationId();
		String key = OptimizationDataUtil.buildResponseFilePath(adminId, optimizationId);
		try {
			return s3ClientProviderService.isFileExisting(bucketName, key);
		} catch (Exception e) {
			LOGGER.error("Error checking existence of response file {} in bucket {}: {}", key, bucketName, e.getMessage());
			return false;
		}
	}

}
