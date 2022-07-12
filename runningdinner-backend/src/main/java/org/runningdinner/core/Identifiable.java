package org.runningdinner.core;

import java.util.UUID;

public interface Identifiable {

	UUID getId();
	
  default boolean isNew() {

    return getId() == null;
  }
  
  default boolean isSameId(UUID id) {
    
    return getId().equals(id);
  }

}
