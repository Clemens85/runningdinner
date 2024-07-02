package org.runningdinner.mail.formatter;

import org.runningdinner.admin.message.dinner.RunningDinnerRelatedMessage;
import org.runningdinner.common.service.LocalizationProviderService;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.util.DateTimeUtil;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

@Component
public class RunningDinnerDeletionWarningMessageFormatter {

  private final UrlGenerator urlGenerator;

  private final MessageSource messageSource;

  private final LocalizationProviderService localizationProviderService;

  public RunningDinnerDeletionWarningMessageFormatter(UrlGenerator urlGenerator, MessageSource messageSource, LocalizationProviderService localizationProviderService) {
    this.urlGenerator = urlGenerator;
    this.messageSource = messageSource;
    this.localizationProviderService = localizationProviderService;
  }

  public RunningDinnerRelatedMessage formatRunningDinnerDeletionWarnMessage(RunningDinner runningDinner, LocalDateTime deletionDate, LocalDateTime now) {
    final Locale locale = localizationProviderService.getLocaleOfDinner(runningDinner);
    final String administrationUrl = urlGenerator.constructAdministrationUrl(runningDinner.getAdminId());

    String subject = messageSource.getMessage("message.subject.runningdinner.deletion.warning", null, locale);
    String message = messageSource.getMessage("message.template.runningdinner.deletion.warning", new Object[] {
    }, locale);

    String date = DateTimeUtil.getDefaultFormattedDate(runningDinner.getDate(), runningDinner.getLanguageCode());

    // Calculate days between now and deletionDate
    int days = calculateDaysOfDeletion(deletionDate, now);

    message = message.replaceAll(FormatterUtil.ADMIN_RUNNINGDINNER_LINK, administrationUrl);
    message = message.replaceAll(FormatterUtil.DATE, date);
    message = message.replaceAll(FormatterUtil.DAYS, String.valueOf(days));
    message = message.replaceAll(FormatterUtil.PAYMENT_OPTIONS_BRAND_NAME, FormatterUtil.DEFAULT_BRAND_NAME);

    return new RunningDinnerRelatedMessage(subject, message, runningDinner);
  }

  protected int calculateDaysOfDeletion(LocalDateTime deletionDate, LocalDateTime now) {
    return Math.max(0, (int) ChronoUnit.DAYS.between(now.toLocalDate(), deletionDate.toLocalDate()));
  }

}
