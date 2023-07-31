package org.runningdinner.mail.formatter;

import java.util.Locale;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.message.dinner.RunningDinnerRelatedMessage;
import org.runningdinner.common.service.LocalizationProviderService;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Participant;
import org.runningdinner.payment.paymentoptions.PaymentOptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

@Component
public class NewParticipantSubscribedFormatter {

  @Autowired
  private UrlGenerator urlGenerator;

  @Autowired
  private MessageSource messageSource;
  
  @Autowired
  private LocalizationProviderService localizationProviderService;
  
  public RunningDinnerRelatedMessage formatNewParticipantSubscribedMessage(final RunningDinner runningDinner, final Participant participant) {
    
    Locale locale = localizationProviderService.getLocaleOfDinner(runningDinner);
    
    final String activationUrl = urlGenerator.constructParticipantActivationUrl(runningDinner.getPublicSettings().getPublicId(), participant.getId());
    String subject = messageSource.getMessage("message.subject.participant.subscribed", null, locale);
    String message = messageSource.getMessage("message.template.participant.subscribed", null, locale);
    Assert.state(StringUtils.isNotEmpty(message), "Message template must not be empty!");
    Assert.state(StringUtils.isNotEmpty(subject), "Subject must not be empty!");
    
    message = message.replaceAll(FormatterUtil.FIRSTNAME, participant.getName().getFirstnamePart());
    message = message.replaceAll(FormatterUtil.LASTNAME, participant.getName().getLastname());
    message = message.replaceAll(FormatterUtil.ACTIVATE_PARTICIPANT_SUBSCRIPTION_LINK, activationUrl);
    message = message.replaceAll(FormatterUtil.PUBLIC_RUNNING_DINNER_TITLE, runningDinner.getPublicSettings().getPublicTitle());

    return new RunningDinnerRelatedMessage(subject,message, runningDinner);
  }

  public RunningDinnerRelatedMessage formatNewParticipantSubscribedWithPaymentMessage(RunningDinner runningDinner, Participant participant, PaymentOptions paymentOptions) {
  
    Locale locale = localizationProviderService.getLocaleOfDinner(runningDinner);
    
    String subject = messageSource.getMessage("message.subject.participant.subscribed.payment", null, locale);
    String message = messageSource.getMessage("message.template.participant.subscribed.payment", null, locale);
    Assert.state(StringUtils.isNotEmpty(message), "Message template must not be empty!");
    Assert.state(StringUtils.isNotEmpty(subject), "Subject must not be empty!");

    subject = subject.replaceAll(FormatterUtil.PAYMENT_OPTIONS_BRAND_NAME, paymentOptions.getBrandName());

    message = message.replaceAll(FormatterUtil.FIRSTNAME, participant.getName().getFirstnamePart());
    message = message.replaceAll(FormatterUtil.LASTNAME, participant.getName().getLastname());
    message = message.replaceAll(FormatterUtil.EMAIL, runningDinner.getPublicSettings().getPublicContactEmail());
    message = message.replaceAll(FormatterUtil.PAYMENT_OPTIONS_BRAND_NAME, paymentOptions.getBrandName());
    message = message.replaceAll(FormatterUtil.PUBLIC_RUNNING_DINNER_TITLE, runningDinner.getPublicSettings().getPublicTitle());
    
    String teamPartnerInfo = StringUtils.EMPTY;
    if (StringUtils.isNotBlank(participant.getTeamPartnerWishEmail())) {
      teamPartnerInfo = messageSource.getMessage("message.template.participant.subscribed.teampartnerinfo.email", null, locale);
    } else if (participant.getTeamPartnerWishOriginatorId() != null) {
      teamPartnerInfo = messageSource.getMessage("message.template.participant.subscribed.teampartnerinfo.registration", null, locale);      
    }
    message = message.replaceAll(FormatterUtil.TEAM_PARTNER_IFNO, teamPartnerInfo);
    
    return new RunningDinnerRelatedMessage(subject, message, runningDinner);
  }
}
