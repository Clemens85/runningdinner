package org.runningdinner.admin.message.proposal;

import java.util.Optional;

public interface ProposalRepository {

  void saveProposal(ProposalBase proposal);

  Optional<ProposalBase> findProposalByStoragePath(String storagePath);
}
