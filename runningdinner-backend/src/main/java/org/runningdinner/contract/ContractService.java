package org.runningdinner.contract;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import jakarta.persistence.EntityNotFoundException;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.deleted.DeletedRunningDinner;
import org.runningdinner.common.service.ValidatorService;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinner.RunningDinnerType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

@Service
public class ContractService {

  @Autowired
  private ContractRepository contractRepository;
  
  @Autowired
  private ValidatorService validatorService;
  
  @Transactional
  public Optional<Contract> createContractIfNeeded(Contract incomingContract, RunningDinner parentRunningDinner) {
    
    if (!checkContractSetForStandardDinner(parentRunningDinner, incomingContract)) {
      return Optional.empty();
    }
    
    Assert.state(incomingContract.isNew(), "Can only persist contract without an existing ID");
    Assert.isNull(incomingContract.getCreatedAt(), "createdAt");
    Assert.isNull(incomingContract.getModifiedAt(), "modifiedAt");

    checkContractIsValid(incomingContract);
    
    incomingContract.setAdvAcknowledged(true);
    incomingContract.setNewsletterEnabledChangeDateTime(LocalDateTime.now());
    incomingContract.setParentRunningDinnerId(parentRunningDinner.getId());
    incomingContract.setParentDeletedRunningDinnerId(null);
    
    return Optional.of(contractRepository.save(incomingContract));
  }
  
  public Contract findContractByRunningDinner(RunningDinner runningDinner) {
    
    Contract result = contractRepository.findByParentRunningDinnerId(runningDinner.getId());
    return result;
  }

  @Transactional
  public void updateContractToDeletedDinner(RunningDinner runningDinner, DeletedRunningDinner deletedRunningDinner) {

    Contract contract = findContractByRunningDinner(runningDinner);
    if (contract != null) {
      contract.setParentRunningDinnerId(null);
      contract.setParentDeletedRunningDinnerId(deletedRunningDinner.getId());
      contractRepository.save(contract);
    }
  }

  public Contract findContractById(UUID id) {

    Optional<Contract> result = contractRepository.findById(id);
    return result.orElseThrow(() -> new EntityNotFoundException("Could not find contract by id " + id));
  }
  
  private void checkContractIsValid(Contract contract) {
    
    validatorService.invokeValidation(StringUtils.EMPTY, contract);
  }
  
  private static boolean checkContractSetForStandardDinner(RunningDinner runningDinner, Contract contract) {

    if (runningDinner.getRunningDinnerType() == RunningDinnerType.DEMO) {
      return false;
    }
    Assert.notNull(contract, "Expected contract to be not-null for non-demo runningdinner");
    return true;
  }
  
}
