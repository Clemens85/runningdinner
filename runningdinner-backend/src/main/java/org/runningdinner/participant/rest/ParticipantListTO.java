
package org.runningdinner.participant.rest;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

public class ParticipantListTO implements Serializable {

  private static final long serialVersionUID = 1L;

  private List<ParticipantTO> participants = new ArrayList<>();

  private String adminId;

  public ParticipantListTO() {
    super();
  }

  public ParticipantListTO(List<ParticipantTO> participants, String adminId) {
    super();
    this.participants = participants;
    this.adminId = adminId;
  }

  public List<ParticipantTO> getParticipants() {

    return participants;
  }

  public void setParticipants(List<ParticipantTO> participants) {

    this.participants = participants;
  }

  public String getAdminId() {

    return adminId;
  }

  public void setAdminId(String adminId) {

    this.adminId = adminId;
  }

  public void addParticipant(final ParticipantTO participant) {

    this.participants.add(participant);
  }

}
