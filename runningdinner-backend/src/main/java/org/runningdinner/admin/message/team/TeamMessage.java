
package org.runningdinner.admin.message.team;

import org.hibernate.validator.constraints.SafeHtml;
import org.runningdinner.mail.formatter.TeamArrangementTextMessage;

import jakarta.validation.constraints.NotBlank;

public class TeamMessage extends BaseTeamMessage implements TeamArrangementTextMessage {

  private static final long serialVersionUID = 1L;

  @NotBlank
  @SafeHtml
  protected String hostMessagePartTemplate;

  @NotBlank
  @SafeHtml
  protected String nonHostMessagePartTemplate;

  @Override
  public String getHostMessagePartTemplate() {

    return hostMessagePartTemplate;
  }

  public void setHostMessagePartTemplate(String hostMessagePartTemplate) {

    this.hostMessagePartTemplate = hostMessagePartTemplate;
  }

  @Override
  public String getNonHostMessagePartTemplate() {

    return nonHostMessagePartTemplate;
  }

  public void setNonHostMessagePartTemplate(String nonHostMessagePartTemplate) {

    this.nonHostMessagePartTemplate = nonHostMessagePartTemplate;
  }

}
