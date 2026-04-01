package org.runningdinner.mail.formatter;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.message.dinner.RunningDinnerRelatedMessage;
import org.runningdinner.common.service.LocalizationProviderService;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.core.MealSpecifics;
import org.runningdinner.core.PublicSettings;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Participant;
import org.runningdinner.payment.paymentoptions.PaymentOptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import java.util.Locale;

@Component
public class NewParticipantSubscribedFormatter {

  @Autowired
  private UrlGenerator urlGenerator;

  @Autowired
  private MessageSource messageSource;
  
  @Autowired
  private LocalizationProviderService localizationProviderService;
  
  @Autowired
  private MessageFormatterHelperService messageFormatterHelperService;
  
  public RunningDinnerRelatedMessage formatNewParticipantSubscribedMessage(final RunningDinner runningDinner, 
                                                                          final Participant participant,
                                                                          final Participant teamPartnerWishChild) {
    
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
    message = message.replaceAll(FormatterUtil.REGISTRATION_SUMMARY, buildRegistrationSummary(participant, teamPartnerWishChild, locale));
    message = message.replaceAll(FormatterUtil.ORGANIZER_CONTACT_HINT, buildOrganizerContactHint(runningDinner, locale));

    return new RunningDinnerRelatedMessage(subject, message, runningDinner);
  }

  public RunningDinnerRelatedMessage formatNewParticipantSubscribedWithPaymentMessage(RunningDinner runningDinner, 
                                                                                     Participant participant, 
                                                                                     PaymentOptions paymentOptions,
                                                                                     Participant teamPartnerWishChild) {
  
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
    message = message.replaceAll(FormatterUtil.REGISTRATION_SUMMARY, buildRegistrationSummary(participant, teamPartnerWishChild, locale));
    message = message.replaceAll(FormatterUtil.ORGANIZER_CONTACT_HINT, buildOrganizerContactHint(runningDinner, locale));
    
    return new RunningDinnerRelatedMessage(subject, message, runningDinner);
  }

  private String buildRegistrationSummary(Participant participant, Participant teamPartnerWishChild, Locale locale) {
    
    String header = messageSource.getMessage("message.template.participant.subscribed.registration_summary.header", null, locale);
    String nameLabel = messageSource.getMessage("message.template.participant.subscribed.registration_summary.name", null, locale);
    String emailLabel = messageSource.getMessage("message.template.participant.subscribed.registration_summary.email", null, locale);
    String addressLabel = messageSource.getMessage("message.template.participant.subscribed.registration_summary.address", null, locale);
    String numSeatsLabel = messageSource.getMessage("message.template.participant.subscribed.registration_summary.numseats", null, locale);
    String mealSpecificsLabel = messageSource.getMessage("message.template.participant.subscribed.registration_summary.mealspecifics", null, locale);
    String teamPartnerLabel = messageSource.getMessage("message.template.participant.subscribed.registration_summary.teampartner", null, locale);
    
    StringBuilder sb = new StringBuilder();
    sb.append(header).append(FormatterUtil.NEWLINE);
    sb.append(nameLabel).append(": ").append(participant.getName().getFullnameFirstnameFirst()).append(FormatterUtil.NEWLINE);
    sb.append(emailLabel).append(": ").append(participant.getEmail()).append(FormatterUtil.NEWLINE);
    sb.append(addressLabel).append(": ").append(FormatterUtil.generateAddressString(participant)).append(FormatterUtil.NEWLINE);
    sb.append(numSeatsLabel).append(": ").append(participant.getNumSeats()).append(FormatterUtil.NEWLINE);

    String mealSpecificsStr = formatMealSpecificsWithNote(participant.getMealSpecifics(), locale);
    sb.append(mealSpecificsLabel).append(": ").append(mealSpecificsStr).append(FormatterUtil.NEWLINE);
    
    if (StringUtils.isNotBlank(participant.getTeamPartnerWishEmail())) {
      sb.append(teamPartnerLabel).append(": ").append(participant.getTeamPartnerWishEmail()).append(FormatterUtil.NEWLINE);
    }
    
    if (teamPartnerWishChild != null) {
      String registeredTeamPartnerLabel = messageSource.getMessage("message.template.participant.subscribed.registration_summary.registered_teampartner", null, locale);
      sb.append(registeredTeamPartnerLabel).append(": ").append(teamPartnerWishChild.getName().getFullnameFirstnameFirst());
      if (StringUtils.isNotBlank(teamPartnerWishChild.getEmail())) {
        sb.append(" (").append(teamPartnerWishChild.getEmail()).append(")");
      }
      sb.append(FormatterUtil.NEWLINE);
    }
    
    return sb.toString();
  }
  
  private String buildOrganizerContactHint(RunningDinner runningDinner, Locale locale) {
    
    PublicSettings publicSettings = runningDinner.getPublicSettings();
    String hint = messageSource.getMessage("message.template.participant.subscribed.organizer_contact_hint", null, locale);

    StringBuilder sb = new StringBuilder();
    sb.append(hint);
    if (StringUtils.isNotBlank(publicSettings.getPublicContactName())) {
      sb.append(publicSettings.getPublicContactName());
    }
    if (StringUtils.isNotBlank(publicSettings.getPublicContactEmail())) {
      if (StringUtils.isNotBlank(publicSettings.getPublicContactName())) {
        sb.append(", ");
      }
      sb.append(publicSettings.getPublicContactEmail());
    }
    if (StringUtils.isNotBlank(publicSettings.getPublicContactMobileNumber())) {
      sb.append(", ").append(publicSettings.getPublicContactMobileNumber());
    }
    sb.append(FormatterUtil.TWO_NEWLINES);
    
    return sb.toString();
  }

  private String formatMealSpecificsWithNote(MealSpecifics mealSpecifics, Locale locale) {
    
    String noMealSpecifics = messageSource.getMessage("message.template.participant.subscribed.registration_summary.mealspecifics.none", null, locale);
    if (mealSpecifics == null) {
      return noMealSpecifics;
    }
    String items = messageFormatterHelperService.formatMealSpecificItems(mealSpecifics, locale);
    String note = StringUtils.trimToEmpty(mealSpecifics.getMealSpecificsNote());
    if (StringUtils.isNotBlank(items) && StringUtils.isNotBlank(note)) {
      return items + ", " + note;
    }
    if (StringUtils.isNotBlank(items)) {
      return items;
    }
    if (StringUtils.isNotBlank(note)) {
      return note;
    }
    return noMealSpecifics;
  }
}
