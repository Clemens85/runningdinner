package org.runningdinner.dinnerroute.optimization.data;

import org.apache.commons.io.FileUtils;
import org.runningdinner.dinnerroute.optimization.lock.OptimizationInstanceStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;

/**
 * This class provides a local file-based implementation of the OptimizationDataProvider interface and is used for testing purposes.
 * It is only active in the 'dev' profile and if the S3 implementation (OptimizationDataProviderS3) is not active.
 */
@Service
@Profile("dev")
@ConditionalOnMissingBean(OptimizationDataProviderS3.class)
public class OptimizationDataProviderLocalFile implements OptimizationDataProvider {

	private static final Logger LOGGER = LoggerFactory.getLogger(OptimizationDataProviderLocalFile.class);

	private static final String DEST_FOLDER = "/home/clemens/Projects/runningdinner-functions/packages/optimization/test-data";

	public OptimizationDataProviderLocalFile() {
		LOGGER.info("Using local file-based OptimizationDataProvider with destination folder: {}. *** SHOULD NEVER BE ACTIVE IN PROD ***", DEST_FOLDER);
	}

	@Override
	public String readResponseData(String adminId, String optimizationId) {

		String responseFilePath = OptimizationDataUtil.buildResponseFilePath(adminId, optimizationId);
		responseFilePath = DEST_FOLDER + "/" + responseFilePath;
		File responseFile = new File(responseFilePath);

		try {
			return FileUtils.readFileToString(responseFile, "UTF-8");
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	@Override
	public void writeRequestData(String adminId, String optimizationId, String requestJsonString) {
		String requestFilePath = OptimizationDataUtil.buildRequestFilePath(adminId, optimizationId);
		requestFilePath = DEST_FOLDER + "/" + requestFilePath;
		File requestFile = new File(requestFilePath);

		try {
			FileUtils.forceMkdir(requestFile.getParentFile());
			FileUtils.writeStringToFile(requestFile, requestJsonString, "UTF-8");
		} catch (IOException e) {
			throw new RuntimeException(e);
		}
	}

	@Override
	public void setOptimizationFinished(String adminId, String optimizationId, OptimizationInstanceStatus status) {
		LOGGER.info("Setting optimization finished for adminId: {}, optimizationId: {}, status: {}", adminId, optimizationId, status);
	}
}
