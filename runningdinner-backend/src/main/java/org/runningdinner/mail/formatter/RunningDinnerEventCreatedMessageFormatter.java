package org.runningdinner.mail.formatter;

import java.util.Locale;
import java.util.Optional;

import org.runningdinner.admin.message.dinner.RunningDinnerRelatedMessage;
import org.runningdinner.common.service.LocalizationProviderService;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.mail.PortalTokenProvider;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

@Component
public class RunningDinnerEventCreatedMessageFormatter {

  private UrlGenerator urlGenerator;

  private MessageSource messageSource;

  private LocalizationProviderService localizationProviderService;

  /**
   * Injected optionally to avoid core→portal coupling.
   * When present, the combined portal+confirmation link replaces the legacy acknowledge link.
   */
  private Optional<PortalTokenProvider> portalTokenProvider;

  public RunningDinnerEventCreatedMessageFormatter(UrlGenerator urlGenerator, MessageSource messageSource,
      LocalizationProviderService localizationProviderService,
      Optional<PortalTokenProvider> portalTokenProvider) {
    this.urlGenerator = urlGenerator;
    this.messageSource = messageSource;
    this.localizationProviderService = localizationProviderService;
    this.portalTokenProvider = portalTokenProvider;
  }

  public RunningDinnerRelatedMessage formatRunningDinnerCreatedMessage(RunningDinner runningDinner) {
    final Locale locale = localizationProviderService.getLocaleOfDinner(runningDinner);
    final String administrationUrl = urlGenerator.constructAdministrationUrl(runningDinner.getAdminId());
    final String acknowledgeUrl = buildAcknowledgeUrl(runningDinner);

    String subject = messageSource.getMessage("message.subject.runningdinner.created", null, locale);
    String message = messageSource.getMessage("message.template.runningdinner.created", new Object[] {
    }, locale);
    
    message = message.replaceAll(FormatterUtil.ADMIN_RUNNINGDINNER_LINK, administrationUrl);
    message = message.replaceAll(FormatterUtil.ACKNOWLEDGE_RUNNINGDINNER_LINK, acknowledgeUrl);
    
    return new RunningDinnerRelatedMessage(subject, message, runningDinner);
  }

  /**
   * Builds the acknowledge/confirm URL for the organizer.
   * If a {@link PortalTokenProvider} is available, returns the combined portal+confirmation link.
   * Otherwise falls back to the legacy standalone acknowledge link.
   */
  private String buildAcknowledgeUrl(RunningDinner runningDinner) {
    return portalTokenProvider
        .map(provider -> {
          String portalToken = provider.getOrCreatePortalToken(runningDinner.getEmail());
          return urlGenerator.constructPortalOrganizerConfirmationUrl(portalToken, runningDinner.getAdminId());
        })
        .orElseGet(() -> urlGenerator.constructAdministrationAcknowledgeUrl(runningDinner));
  }
  
}
