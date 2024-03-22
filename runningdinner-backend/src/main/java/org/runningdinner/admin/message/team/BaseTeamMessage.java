package org.runningdinner.admin.message.team;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import jakarta.validation.constraints.NotNull;

import org.runningdinner.admin.message.BaseMessage;

import com.google.common.base.MoreObjects;

public abstract class BaseTeamMessage extends BaseMessage {
  
  private static final long serialVersionUID = 1L;

  @NotNull(message = "error.required.message.teamselection")
  protected TeamSelection teamSelection;

  protected List<UUID> customSelectedTeamIds = new ArrayList<>();
  
  public TeamSelection getTeamSelection() {

    return teamSelection;
  }

  public void setTeamSelection(TeamSelection teamSelection) {

    this.teamSelection = teamSelection;
  }

  public List<UUID> getCustomSelectedTeamIds() {

    return customSelectedTeamIds;
  }

  public void setCustomSelectedTeamIds(List<UUID> customSelectedTeamIds) {

    this.customSelectedTeamIds = customSelectedTeamIds;
  }

  @Override
  public String toString() {
    
    return MoreObjects
            .toStringHelper(this)
            .addValue(getMessage())
            .addValue(getTeamSelection())
            .toString();
  }

}
