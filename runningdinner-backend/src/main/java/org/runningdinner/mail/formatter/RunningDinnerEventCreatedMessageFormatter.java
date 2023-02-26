package org.runningdinner.mail.formatter;

import java.util.Locale;

import org.runningdinner.admin.message.dinner.RunningDinnerRelatedMessage;
import org.runningdinner.common.service.LocalizationProviderService;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.core.RunningDinner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

@Component
public class RunningDinnerEventCreatedMessageFormatter {

  private UrlGenerator urlGenerator;

  private MessageSource messageSource;

  private LocalizationProviderService localizationProviderService;
  
  @Autowired
  public RunningDinnerEventCreatedMessageFormatter(UrlGenerator urlGenerator, MessageSource messageSource,
      LocalizationProviderService localizationProviderService) {
    this.urlGenerator = urlGenerator;
    this.messageSource = messageSource;
    this.localizationProviderService = localizationProviderService;
  }

  public RunningDinnerRelatedMessage formatRunningDinnerCreatedMessage(RunningDinner runningDinner) {
    final Locale locale = localizationProviderService.getLocaleOfDinner(runningDinner);
    final String administrationUrl = urlGenerator.constructAdministrationUrl(runningDinner.getAdminId());
    final String acknowledgeUrl = urlGenerator.constructAdministrationAcknowledgeUrl(runningDinner);

    String subject = messageSource.getMessage("message.subject.runningdinner.created", null, locale);
    String message = messageSource.getMessage("message.template.runningdinner.created", new Object[] {
    }, locale);
    
    message = message.replaceAll(FormatterUtil.ADMIN_RUNNINGDINNER_LINK, administrationUrl);
    message = message.replaceAll(FormatterUtil.ACKNOWLEDGE_RUNNINGDINNER_LINK, acknowledgeUrl);
    
    return new RunningDinnerRelatedMessage(subject, message, runningDinner);
  }
  
}
