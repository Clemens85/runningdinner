
package org.runningdinner.admin.message.participant;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import javax.validation.constraints.NotNull;

import org.runningdinner.admin.message.BaseMessage;

import com.google.common.base.MoreObjects;

public class ParticipantMessage extends BaseMessage {

  private static final long serialVersionUID = -4064098319216852653L;

  @NotNull(message = "error.required.message.participantselection")
  private ParticipantSelection participantSelection;

  private List<UUID> customSelectedParticipantIds = new ArrayList<>();

  public ParticipantSelection getParticipantSelection() {

    return participantSelection;
  }

  public void setParticipantSelection(ParticipantSelection participantSelection) {

    this.participantSelection = participantSelection;
  }

  public List<UUID> getCustomSelectedParticipantIds() {

    return customSelectedParticipantIds;
  }

  public void setCustomSelectedParticipantIds(List<UUID> customSelectedParticipantIds) {

    this.customSelectedParticipantIds = customSelectedParticipantIds;
  }

  @Override
  public String toString() {

    return MoreObjects
            .toStringHelper(this)
            .addValue(participantSelection)
            .addValue(getSubject())
            .addValue(getMessage())
            .toString();
  }

  
}
