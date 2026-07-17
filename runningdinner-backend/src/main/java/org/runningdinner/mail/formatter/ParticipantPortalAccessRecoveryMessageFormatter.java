package org.runningdinner.mail.formatter;

import org.runningdinner.admin.message.job.Message;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import java.util.Locale;

/**
 * Formats the portal access recovery email that is sent when a user requests recovery
 * of their portal link via POST /rest/participant-portal/v1/access-recovery.
 * <p>
 * The email contains a single portal link ({host}/my-events/{portalToken}) which
 * restores all events for that email address in one click.
 */
@Component
public class ParticipantPortalAccessRecoveryMessageFormatter {

  private static final String PORTAL_LINK_PLACEHOLDER = "{portalLink}";

  private final MessageSource messageSource;

  public ParticipantPortalAccessRecoveryMessageFormatter(MessageSource messageSource) {
    this.messageSource = messageSource;
  }

  /**
   * Formats the recovery email.
   *
   * @param recipientEmail the email address of the recipient (used as the reply-to address)
   * @param portalLink     the full portal recovery URL ({host}/my-events/{portalToken})
   * @param locale         the locale to use for the email (derived from the user's browser language)
   * @return a {@link Message} ready to be sent via {@link org.runningdinner.mail.MailService}
   */
  public Message formatRecoveryMessage(String recipientEmail, String portalLink, Locale locale) {
    Assert.hasText(portalLink, "portalLink must not be empty");

    String subject = messageSource.getMessage("message.subject.portal.access.recovery", null, locale);
    String content = messageSource.getMessage("message.template.portal.access.recovery", null, locale);

    Assert.hasText(subject, "Portal recovery email subject must not be empty");
    Assert.hasText(content, "Portal recovery email template must not be empty");

    content = content.replace(PORTAL_LINK_PLACEHOLDER, portalLink);

    return new Message(subject, content, recipientEmail);
  }
}
