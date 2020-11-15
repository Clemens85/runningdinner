
package org.runningdinner.participant;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import javax.validation.constraints.NotNull;

public class TeamCancellation {

  @NotNull
  private UUID teamId;

  private Set<UUID> replacementParticipantIds = new HashSet<>();

  @NotNull
  private boolean replaceTeam;

  @NotNull
  private boolean dryRun;
  
  public UUID getTeamId() {

    return teamId;
  }

  public void setTeamId(UUID teamId) {

    this.teamId = teamId;
  }

  public Set<UUID> getReplacementParticipantIds() {

    return replacementParticipantIds;
  }

  public void setReplacementParticipantIds(Set<UUID> replacementParticipantIds) {

    this.replacementParticipantIds = replacementParticipantIds;
  }

  public boolean isReplaceTeam() {

    return replaceTeam;
  }

  public void setReplaceTeam(boolean replaceTeam) {

    this.replaceTeam = replaceTeam;
  }

  public boolean isDryRun() {

    return dryRun;
  }

  public void setDryRun(boolean dryRun) {

    this.dryRun = dryRun;
  }
  

}
