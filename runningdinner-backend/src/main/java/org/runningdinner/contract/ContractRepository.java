package org.runningdinner.contract;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ContractRepository extends JpaRepository<Contract, UUID>  {

  Contract findByParentRunningDinnerId(UUID parentRunningDinnerId);

}
