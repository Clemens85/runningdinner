package org.runningdinner.admin.message.proposal;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Primary
public class TestProposalRepositoryInMemory implements ProposalRepository {

  private final List<ProposalExample> proposals = new ArrayList<>();

  @Override
  public void saveProposal(final ProposalExample proposal) {
    proposals.add(proposal);
  }

  @Override
  public Optional<ProposalExample> findProposalByStoragePath(final String storagePath) {
    return proposals.stream().filter(p -> p.storagePath().equals(storagePath)).findFirst();
  }

  public List<ProposalExample> getProposals() {
    return this.proposals;
  }

  public ProposalExample getLast() {
    return this.proposals.getLast();
  }

  public void clear() {
    this.proposals.clear();
  }
}
