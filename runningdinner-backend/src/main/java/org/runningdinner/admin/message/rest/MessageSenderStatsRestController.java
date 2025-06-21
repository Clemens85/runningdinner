package org.runningdinner.admin.message.rest;

import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.message.job.stats.MessageSenderStats;
import org.runningdinner.admin.message.job.stats.MessageSenderStatsService;
import org.runningdinner.mail.pool.MailSenderPoolService;
import org.runningdinner.mail.pool.PoolableMailSender;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping(value = "/rest/mailproviders/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class MessageSenderStatsRestController {

  private final MailSenderPoolService mailSenderPoolService;
  private final MessageSenderStatsService messageSenderStatsService;
  private final RunningDinnerService runningDinnerService;

  public MessageSenderStatsRestController(MailSenderPoolService mailSenderPoolService, MessageSenderStatsService messageSenderStatsService, RunningDinnerService runningDinnerService) {
    this.mailSenderPoolService = mailSenderPoolService;
    this.messageSenderStatsService = messageSenderStatsService;
		this.runningDinnerService = runningDinnerService;
	}

  @GetMapping("/runningdinner/{adminId}/stats")
  public List<MessageSenderStatsDTO> getMessageSenderStats(@PathVariable String adminId) {

    runningDinnerService.findRunningDinnerByAdminId(adminId);

    List<PoolableMailSender> mailSenders = mailSenderPoolService.getAllConfiguredMailSenders();
    MessageSenderStats stats = messageSenderStatsService.getStatsBySender(LocalDate.now());

    return mailSenders.stream()
                      .map(mailSender -> new MessageSenderStatsDTO(
                          mailSender.getKey().toString(),
                          mailSender.getPriority(),
                          mailSender.isFallback(),
                          mailSender.getMailSenderLimit().dailyLimit(),
                          mailSender.getMailSenderLimit().monthlyLimit(),
                          stats.getSentTasksOfDay(mailSender.getKey().toString()),
                          stats.getSentTasksOfMonth(mailSender.getKey().toString())
                      ))
                      .collect(Collectors.toList());
  }
}
