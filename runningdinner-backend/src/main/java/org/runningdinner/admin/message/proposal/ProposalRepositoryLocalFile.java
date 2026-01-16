package org.runningdinner.admin.message.proposal;

import org.apache.commons.io.FileUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.Optional;

/**
 * This class provides a local file-based implementation of the ProposalRepository interface and is used for testing purposes.
 * It is only active in the 'dev' profile and if the S3 implementation (ProposalRepositoryS3) is not active.
 */
@Service
@Profile("dev")
@ConditionalOnMissingBean(ProposalRepositoryS3.class)
public class ProposalRepositoryLocalFile implements ProposalRepository {

  private static final Logger LOGGER = LoggerFactory.getLogger(ProposalRepositoryLocalFile.class);

  private final String destFolder;

  public ProposalRepositoryLocalFile() {
    this.destFolder = System.getProperty("java.io.tmpdir") + File.separator + "runningdinner-proposals";
    LOGGER.info("Using local file-based ProposalRepository with destination folder: {}. *** SHOULD NEVER BE ACTIVE IN PROD ***", destFolder);
  }

  @Override
  public void saveProposal(final ProposalExample proposal) {
    String filePath = destFolder + File.separator + proposal.storagePath();
    File file = new File(filePath);

    try {
      FileUtils.forceMkdir(file.getParentFile());
      FileUtils.writeStringToFile(file, proposal.textContent(), "UTF-8");
      LOGGER.debug("Saved proposal to local file: {}", filePath);
    } catch (IOException e) {
      String errorMsg = "Failed to write proposal to local file: " + filePath;
      LOGGER.error(errorMsg, e);
      throw new RuntimeException(errorMsg, e);
    }
  }

  @Override
  public Optional<ProposalExample> findProposalByStoragePath(final String storagePath) {
    String filePath = destFolder + File.separator + storagePath;
    File file = new File(filePath);

    if (!file.exists() || !file.isFile()) {
      LOGGER.debug("Proposal not found in local file repository for storagePath={}, resolved path={}", storagePath, filePath);
      return Optional.empty();
    }

    try {
      String content = FileUtils.readFileToString(file, "UTF-8");
      ProposalExample proposal = new ProposalExample(storagePath, content);
      return Optional.of(proposal);
    } catch (IOException e) {
      LOGGER.error("Failed to read proposal from local file: {}", filePath, e);
      return Optional.empty();
    }
  }
}
