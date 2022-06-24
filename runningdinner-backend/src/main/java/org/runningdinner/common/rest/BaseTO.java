
package org.runningdinner.common.rest;

import java.io.Serializable;
import java.util.UUID;

import org.runningdinner.core.AbstractEntity;
import org.runningdinner.core.Identifiable;

public abstract class BaseTO implements Serializable, Identifiable {

  private static final long serialVersionUID = 1L;

  protected UUID id;

  public BaseTO() {
    
  }

  public BaseTO(final AbstractEntity entity) {
    
    this.id = entity.getId();
  }

  @Override
	public UUID getId() {

    return id;
  }

  public void setId(UUID id) {

    this.id = id;
  }

}
