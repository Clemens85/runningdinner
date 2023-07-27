package org.runningdinner.core;

import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

public interface Identifiable {

  UUID getId();

  @JsonIgnore
  default boolean isNew() {

    return getId() == null;
  }

  @JsonIgnore
  default boolean isSameId(UUID id) {

    return getId().equals(id);
  }

}
