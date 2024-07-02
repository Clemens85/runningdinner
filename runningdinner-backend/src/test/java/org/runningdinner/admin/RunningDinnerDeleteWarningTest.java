package org.runningdinner.admin;

import com.google.common.collect.Iterables;
import org.apache.commons.lang3.StringUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.runningdinner.admin.message.job.MessageType;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.RunningDinnerPreferences;
import org.runningdinner.initialization.CreateRunningDinnerInitializationService;
import org.runningdinner.mail.MailSenderFactory;
import org.runningdinner.mail.mock.MailSenderMockInMemory;
import org.runningdinner.test.util.ApplicationTest;
import org.runningdinner.test.util.TestHelperService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(SpringExtension.class)
@ApplicationTest
public class RunningDinnerDeleteWarningTest {

  private static final LocalDateTime DATE_2024_06_30 = LocalDateTime.of(2024, 6, 30, 10, 10, 0);

  @Autowired
  private RunningDinnerService runningDinnerService;

  @Autowired
  private DeleteOldRunningDinnersSchedulerService deleteOldRunningDinnersSchedulerService;

  @Autowired
  private RunningDinnerDeletionService runningDinnerDeletionService;

  @Autowired
  private TestHelperService testHelperService;

  @Autowired
  private MailSenderFactory mailSenderFactory;

  @Autowired
  private UrlGenerator urlGenerator;

  private RunningDinner runningDinner;
  private MailSenderMockInMemory mailSenderInMemory;
  private String adminUrl;

  @BeforeEach
  public void setUp() throws NoPossibleRunningDinnerException {
    this.runningDinner = testHelperService.createClosedRunningDinner(DATE_2024_06_30.toLocalDate(), CreateRunningDinnerInitializationService.DEFAULT_DINNER_CREATION_ADDRESS);
    this.mailSenderInMemory = (MailSenderMockInMemory) mailSenderFactory.getMailSender(); // Test uses always this implementation
    this.mailSenderInMemory.setUp();
    this.adminUrl = urlGenerator.constructAdministrationUrl(runningDinner.getAdminId());
  }

  @Test
  public void warnAboutDeletion() {

    LocalDateTime now = DATE_2024_06_30.plusDays(3);
    runningDinnerDeletionService.warnAboutDeletion(runningDinner, now);

    List<SimpleMailMessage> messages = getDeletionWarnMessages(this.adminUrl);
    assertThat(messages).hasSize(1);
    SimpleMailMessage warnMessage = Iterables.getFirst(messages, null);

    String messageText = warnMessage.getText();
    assertThat(messageText)
      .contains("aus datenschutzrechtlichen Gründen wird dein Running Dinner Event mit Datum 30.06.2024 in 2 Tagen automatisch gelöscht werden.");

    // Subsequent calls should not send new mails
    runningDinnerDeletionService.warnAboutDeletion(runningDinner, now);
    assertThat(getDeletionWarnMessages(this.adminUrl)).hasSize(1);

    RunningDinnerPreferences preferences = runningDinnerService.getPreferences(runningDinner.getAdminId());
    assertThat(preferences.getBooleanValue(MessageType.RUNNING_DINNER_DELETION_WARN_MESSAGE.name())).isEqualTo(Optional.of(Boolean.TRUE));
  }

  @Test
  public void warnAboutDeletionScheduler() {

    assertThat(getDeletionWarnMessages(this.adminUrl)).isEmpty();

    LocalDateTime now = DATE_2024_06_30.plusDays(1);
    deleteOldRunningDinnersSchedulerService.warnAboutDeletion(now);
    assertThat(getDeletionWarnMessages(this.adminUrl)).isEmpty();
    RunningDinnerPreferences preferences = runningDinnerService.getPreferences(runningDinner.getAdminId());
    assertThat(preferences.getBooleanValue(MessageType.RUNNING_DINNER_DELETION_WARN_MESSAGE.name())).isNotPresent();

    now = DATE_2024_06_30.plusDays(3);
    deleteOldRunningDinnersSchedulerService.warnAboutDeletion(now);
    assertThat(getDeletionWarnMessages(this.adminUrl)).hasSize(1);
    preferences = runningDinnerService.getPreferences(runningDinner.getAdminId());
    assertThat(preferences.getBooleanValue(MessageType.RUNNING_DINNER_DELETION_WARN_MESSAGE.name())).isEqualTo(Optional.of(Boolean.TRUE));

    deleteOldRunningDinnersSchedulerService.warnAboutDeletion(now);
    assertThat(getDeletionWarnMessages(this.adminUrl)).hasSize(1);
  }

  private List<SimpleMailMessage> getDeletionWarnMessages(String adminUrl) {
    return mailSenderInMemory
            .getMessages()
            .stream()
            .filter(m -> StringUtils.equals(m.getSubject(), "runyourdinner: Dein Dinner wird bald gelöscht"))
            .filter(m -> StringUtils.contains(m.getText(), adminUrl))
            .toList();
  }

}
