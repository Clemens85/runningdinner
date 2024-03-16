
package org.runningdinner.common.rest;

import com.google.common.base.MoreObjects;
import org.hibernate.validator.constraints.SafeHtml;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.Set;
import java.util.UUID;

public class RunningDinnerRelatedIdListTO {

  @NotBlank
  @SafeHtml
  private String adminId;

  @NotEmpty
  private Set<UUID> entityIds;

  public String getAdminId() {

    return adminId;
  }

  public void setAdminId(String adminId) {

    this.adminId = adminId;
  }

  public Set<UUID> getEntityIds() {

    return entityIds;
  }

  public void setEntityIds(Set<UUID> entityIds) {

    this.entityIds = entityIds;
  }

  @Override
  public String toString() {

    return MoreObjects.toStringHelper(this)
            .add("adminId", adminId)
            .add("entityIds", entityIds)
            .toString();
  }
}
