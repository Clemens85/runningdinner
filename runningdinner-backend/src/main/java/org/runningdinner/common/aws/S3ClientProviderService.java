package org.runningdinner.common.aws;

import jakarta.annotation.PostConstruct;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.core.util.EnvUtilService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Service
public class S3ClientProviderService {

	private final String awsProfile;
	private final String applicationBucket;

	private S3Client s3Client;

	public S3ClientProviderService(EnvUtilService envUtilService,
																 @Value("${aws.s3.app.bucket}") String applicationBucket) {
		this.awsProfile = envUtilService.getConfigProperty("aws.profile");
		this.applicationBucket = applicationBucket;
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

	public String getApplicationBucket() {
		return applicationBucket;
	}
}
