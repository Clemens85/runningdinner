
package org.runningdinner.core;

import java.io.Serializable;
import java.util.UUID;

public class ChangeTeamHost implements Serializable {

  private static final long serialVersionUID = 1L;

  private UUID teamId;

  private UUID hostingParticipantId;

  private String comment;

  private UUID modificationParticipantId;

  private boolean sendMailToMe;

  public ChangeTeamHost(UUID teamId, UUID hostingParticipantId, String comment, UUID modificationParticipantId, boolean sendMailToMe) {
    this.teamId = teamId;
    this.hostingParticipantId = hostingParticipantId;
    this.comment = comment;
    this.modificationParticipantId = modificationParticipantId;
    this.sendMailToMe = sendMailToMe;
  }

  public ChangeTeamHost() {
  }

  public UUID getTeamId() {

    return teamId;
  }

  public void setTeamId(UUID teamId) {

    this.teamId = teamId;
  }

  public UUID getHostingParticipantId() {

    return hostingParticipantId;
  }

  public void setHostingParticipantId(UUID hostingParticipantId) {

    this.hostingParticipantId = hostingParticipantId;
  }

  public String getComment() {

    return comment;
  }

  public void setComment(String comment) {

    this.comment = comment;
  }

  public UUID getModificationParticipantId() {

    return modificationParticipantId;
  }

  public void setModificationParticipantId(UUID modificationParticipantId) {

    this.modificationParticipantId = modificationParticipantId;
  }

  public boolean isSendMailToMe() {

    return sendMailToMe;
  }

  public void setSendMailToMe(boolean sendMailToMe) {

    this.sendMailToMe = sendMailToMe;
  }

  @Override
  public String toString() {

    return "teamKey=" + teamId + ", hostingParticipantKey=" + hostingParticipantId + ", comment=" + comment + ", modificationParticipantKey=" + modificationParticipantId;
  }

}
