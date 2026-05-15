
package org.runningdinner.selfservice;

import java.util.UUID;

import jakarta.validation.constraints.Size;
import org.hibernate.validator.constraints.SafeHtml;

public class ChangeTeamHost {

  private UUID teamId;

  private UUID participantId;

  private UUID newHostingTeamMemberId;

  @SafeHtml
  @Size(max = 2048)
  private String comment;

  public UUID getTeamId() {

    return teamId;
  }

  public void setTeamId(UUID teamId) {

    this.teamId = teamId;
  }

  public UUID getParticipantId() {

    return participantId;
  }

  public void setParticipantId(UUID participantId) {

    this.participantId = participantId;
  }

  public UUID getNewHostingTeamMemberId() {

    return newHostingTeamMemberId;
  }

  public void setNewHostingTeamMemberId(UUID newHostingTeamMemberId) {

    this.newHostingTeamMemberId = newHostingTeamMemberId;
  }

  public String getComment() {

    return comment;
  }

  public void setComment(String comment) {

    this.comment = comment;
  }

}
