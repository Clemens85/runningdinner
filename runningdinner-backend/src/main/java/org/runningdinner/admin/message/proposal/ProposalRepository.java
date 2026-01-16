package org.runningdinner.admin.message.proposal;

import java.util.Optional;

public interface ProposalRepository {

  void saveProposal(ProposalExample proposal);

  Optional<ProposalExample> findProposalByStoragePath(String storagePath);
}
