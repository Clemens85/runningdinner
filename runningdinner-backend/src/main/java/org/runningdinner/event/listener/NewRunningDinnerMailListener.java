
package org.runningdinner.event.listener;

import java.util.Locale;

import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.dinner.RunningDinnerRelatedMessage;
import org.runningdinner.common.service.LocalizationProviderService;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.event.NewRunningDinnerEvent;
import org.runningdinner.mail.formatter.FormatterUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

@Component
public class NewRunningDinnerMailListener implements ApplicationListener<NewRunningDinnerEvent> {

  @Autowired
  private MessageService messageService;
  
  @Autowired
  private UrlGenerator urlGenerator;

  @Autowired
  private MessageSource messageSource;

  @Autowired
  private LocalizationProviderService localizationProviderService;

  @Override
  public void onApplicationEvent(NewRunningDinnerEvent event) {

    RunningDinner newRunningDinner = event.getNewRunningDinner();

    final Locale locale = localizationProviderService.getLocaleOfDinner(newRunningDinner);
    final String administrationUrl = urlGenerator.constructAdministrationUrl(newRunningDinner.getAdminId());
    final String acknowledgeUrl = urlGenerator.constructAdministrationAcknowledgeUrl(newRunningDinner);

    String subject = messageSource.getMessage("message.subject.runningdinner.created", null, locale);
    String message = messageSource.getMessage("message.template.runningdinner.created", new Object[] {
    }, locale);
    
    message = message.replaceAll(FormatterUtil.ADMIN_RUNNINGDINNER_LINK, administrationUrl);
    message = message.replaceAll(FormatterUtil.ACKNOWLEDGE_RUNNINGDINNER_LINK, acknowledgeUrl);
    
    messageService.sendNewRunningDinnerMessage(new RunningDinnerRelatedMessage(subject, message, newRunningDinner));
  }
}
