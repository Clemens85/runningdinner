
package org.runningdinner.core;

import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.MappedSuperclass;

import com.fasterxml.jackson.annotation.JsonIgnore;

@MappedSuperclass
public abstract class RunningDinnerRelatedEntity extends AbstractEntity implements RunningDinnerRelated {

  private static final long serialVersionUID = 1L;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "runningDinnerId", updatable = false, insertable = false, nullable = false)
  @JsonIgnore
  protected RunningDinner runningDinner;

  @Column(nullable = false)
  protected UUID runningDinnerId;

  @Column(nullable = false, updatable = false)
  protected String adminId;

  protected RunningDinnerRelatedEntity() {
    
  }
  
  protected RunningDinnerRelatedEntity(RunningDinner runningDinner) {
    
    this.setRunningDinner(runningDinner);
  }
  
  public RunningDinner getRunningDinner() {

    return runningDinner;
  }

  public void setRunningDinner(RunningDinner runningDinner) {

    this.runningDinner = runningDinner;
    this.runningDinnerId = runningDinner != null ? runningDinner.getId() : null;
    this.adminId = runningDinner != null ? runningDinner.getAdminId() : null;
  }

  @Override
  public UUID getRunningDinnerId() {

    return runningDinnerId;
  }

  @Override
  public String getAdminId() {

    return adminId;
  }

}
