package org.runningdinner.admin.message.rest;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.job.FailureType;
import org.runningdinner.admin.message.job.MessageTask;
import org.runningdinner.core.util.DateTimeUtil;
import org.runningdinner.mail.sendgrid.SuppressedEmail;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;


@Profile({"dev"})
@RestController
@RequestMapping(value = "/rest/dev/messagejobservice/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class DevOnlyMessageJobServiceRest {

  @Autowired
  private MessageService messageService;
  
  @RequestMapping(value = "/runningdinner/{adminId}/messagejob/{messageJobId}/{email}/simulate-suppression", method = RequestMethod.PUT)
  public MessageTask simulateSuppressedEmailInMessageJob(@PathVariable("adminId") String adminId, 
                                                         @PathVariable("messageJobId") UUID messageJobId,
                                                         @PathVariable("email") String email) {

    SuppressedEmail suppressedEmail = newSuppressedEmail(email);

    List<MessageTask> messageTasks = messageService.findMessageTasks(adminId, messageJobId);
    UUID messageTaskId = messageTasks
                          .stream()
                          .filter(mt -> mt.getRecipientEmail().toLowerCase().trim().equals(email.toLowerCase().trim()))
                          .map(MessageTask::getId)
                          .findAny()
                          .orElseThrow(() -> new IllegalStateException("Could not find MessageTask for " + email));
    
    return messageService.updateMessageTaskAsFailedInNewTransaction(messageTaskId, suppressedEmail);
  }

  private SuppressedEmail newSuppressedEmail(String email) {

    SuppressedEmail result = new SuppressedEmail();
    result.setEmail(email);
    result.setFailureType(FailureType.INVALID_EMAIL);
    result.setReason("550 5.1.1 The email account that you tried to reach does not exist. Please try 5.1.1 double-checking the recipient's email address " +
                     "for typos or 5.1.1 unnecessary spaces. Learn more at 5.1.1 https://support.google.com/mail/?p=NoSuchUser p184si1979633qkd.73 - gsmtp");
    
    ZonedDateTime now = ZonedDateTime.now(DateTimeUtil.getTimeZoneForEuropeBerlin());
    result.setCreated(now.toEpochSecond());
    return result;
  }
  
}
