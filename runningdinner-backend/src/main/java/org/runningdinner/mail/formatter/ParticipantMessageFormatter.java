
package org.runningdinner.mail.formatter;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.AfterPartyLocationService;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Participant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

@Component
public class ParticipantMessageFormatter {

  @Autowired
  private AfterPartyLocationService afterPartyLocationService;
  
  public String formatParticipantMessage(RunningDinner runningDinner, final Participant participant, final SimpleTextMessage textMessage) {

    String theMessage = textMessage.getMessage();

    Assert.state(StringUtils.isNotEmpty(theMessage), "Message template must not be empty!");

    theMessage = theMessage.replaceAll(FormatterUtil.FIRSTNAME, participant.getName().getFirstnamePart());
    theMessage = theMessage.replaceAll(FormatterUtil.LASTNAME, participant.getName().getLastname());
    theMessage = afterPartyLocationService.replaceAfterPartyLocationTemplate(theMessage, runningDinner);
    return theMessage;
  }

}
