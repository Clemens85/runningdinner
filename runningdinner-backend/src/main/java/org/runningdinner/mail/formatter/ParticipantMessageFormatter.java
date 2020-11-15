
package org.runningdinner.mail.formatter;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.participant.Participant;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

@Component
public class ParticipantMessageFormatter {

  public String formatParticipantMessage(final Participant participant, final SimpleTextMessage textMessage) {

    String theMessage = textMessage.getMessage();

    Assert.state(StringUtils.isNotEmpty(theMessage), "Message template must not be empty!");

    theMessage = theMessage.replaceAll(FormatterUtil.FIRSTNAME, participant.getName().getFirstnamePart());
    theMessage = theMessage.replaceAll(FormatterUtil.LASTNAME, participant.getName().getLastname());

    return theMessage;
  }

}
