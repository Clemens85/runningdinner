package org.runningdinner.common.aws;

import jakarta.annotation.PostConstruct;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.core.util.EnvUtilService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class S3ClientProviderService {

	private final String awsProfile;
	private final String routeOptimizationBucket;

	private S3Client s3Client;

	public S3ClientProviderService(EnvUtilService envUtilService,
																 @Value("${aws.s3.route.optimization.bucket}") String routeOptimizationBucket) {
		this.awsProfile = envUtilService.getConfigProperty("aws.profile");
		this.routeOptimizationBucket = routeOptimizationBucket;
	}

	@PostConstruct
	protected void init() {
		this.s3Client = newS3Client();
	}

	private S3Client newS3Client() {
		if (StringUtils.isNotEmpty(awsProfile)) {
			System.setProperty("aws.profile", awsProfile);
		}
		return S3Client.builder().region(Region.EU_CENTRAL_1).build();
	}

	public S3Client getS3Client() {
		return s3Client;
	}

	public String getRouteOptimizationBucket() {
		return routeOptimizationBucket;
	}

	public boolean isFileExisting(String bucketName, String key) {
		try {
			// Fetch the metadata for the lock file using a HeadObjectRequest
			HeadObjectRequest headObjectRequest = HeadObjectRequest.builder()
							.bucket(bucketName)
							.key(key)
							.build();
			s3Client.headObject(headObjectRequest);
			return true;
		} catch (NoSuchKeyException e) {
			// Expected exception if the file does not exist
			return false;
		}
	}

	public String readFileContentToString(String bucketName, String key) throws IOException {
		GetObjectRequest getObjectRequest = GetObjectRequest.builder()
						.bucket(bucketName)
						.key(key)
						.build();

		try (var inputStream = s3Client.getObject(getObjectRequest)) {
			return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
		}
	}

	public void writeStringToFile(String bucketName, String key, String fileContent, String contentType, Map<String, String> metadata) {
		PutObjectRequest putObjectRequest = PutObjectRequest
						.builder()
						.bucket(bucketName)
						.key(key)
						.metadata(metadata)
						.contentType(contentType)
						.build();
		s3Client.putObject(putObjectRequest, RequestBody.fromString(fileContent));
	}
}
