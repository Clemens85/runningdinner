package org.runningdinner.admin.message.proposal;

import org.runningdinner.common.aws.S3ClientProviderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
@ConditionalOnProperty(name = "message.proposal.repository.s3.enabled", havingValue = "true", matchIfMissing = true)
public class ProposalRepositoryS3 implements ProposalRepository {

  private static final Logger LOGGER = LoggerFactory.getLogger(ProposalRepositoryS3.class);

  private final S3ClientProviderService s3ClientProviderService;

  public ProposalRepositoryS3(final S3ClientProviderService s3ClientProviderService) {
    this.s3ClientProviderService = s3ClientProviderService;
  }

  @Override
  public void saveProposal(final ProposalExample proposal) {
    try {
      s3ClientProviderService.writeStringToFile(
          s3ClientProviderService.getMessageProposalBucket(),
          proposal.storagePath(),
          proposal.textContent(),
          MediaType.TEXT_PLAIN_VALUE,
          Map.of()
      );
    } catch (Exception e) {
      String errorMsg = "Failed to save proposal to S3 at path: " + proposal.storagePath();
      LOGGER.error(errorMsg, e);
      throw new RuntimeException(errorMsg, e);
    }
  }

  @Override
  public Optional<ProposalExample> findProposalByStoragePath(final String storagePath) {
    try {
			if (!s3ClientProviderService.isFileExisting(s3ClientProviderService.getMessageProposalBucket(), storagePath)) {
				return Optional.empty();
			}

			String content = s3ClientProviderService.readFileContentToString(
          s3ClientProviderService.getMessageProposalBucket(),
          storagePath
      );
      return Optional.of(new ProposalExample(storagePath, content));
    } catch (Exception e) {
      LOGGER.warn("Failed to read proposal from S3 at path: {}", storagePath, e);
      return Optional.empty();
    }
  }
}
