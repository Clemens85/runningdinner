
package org.runningdinner.common.rest;

import java.io.Serializable;
import java.util.UUID;

import org.runningdinner.core.AbstractEntity;

public abstract class BaseTO implements Serializable {

  private static final long serialVersionUID = 1L;

  protected UUID id;

  public BaseTO() {
    
  }

  public BaseTO(final AbstractEntity entity) {
    
    this.id = entity.getId();
  }

  public UUID getId() {

    return id;
  }

  public void setId(UUID id) {

    this.id = id;
  }

}
