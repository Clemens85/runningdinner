
package org.runningdinner.admin.message.dinnerroute;

import org.hibernate.validator.constraints.SafeHtml;
import org.runningdinner.admin.message.team.BaseTeamMessage;
import org.runningdinner.mail.formatter.DinnerRouteTextMessage;

import javax.validation.constraints.NotBlank;

public class DinnerRouteMessage extends BaseTeamMessage implements DinnerRouteTextMessage {

  private static final long serialVersionUID = 1L;

  @NotBlank
  @SafeHtml
  protected String selfTemplate;

  @NotBlank
  @SafeHtml
  protected String hostsTemplate;

  @Override
  public String getSelfTemplate() {

    return selfTemplate;
  }

  public void setSelfTemplate(String selfTemplate) {

    this.selfTemplate = selfTemplate;
  }

  @Override
  public String getHostsTemplate() {

    return hostsTemplate;
  }

  public void setHostsTemplate(String hostsTemplate) {

    this.hostsTemplate = hostsTemplate;
  }

}
