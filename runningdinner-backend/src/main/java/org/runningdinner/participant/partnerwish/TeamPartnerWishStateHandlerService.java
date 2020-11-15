package org.runningdinner.participant.partnerwish;

import java.util.Locale;
import java.util.Optional;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.message.MessageService;
import org.runningdinner.admin.message.dinner.RunningDinnerRelatedMessage;
import org.runningdinner.admin.message.job.MessageJob;
import org.runningdinner.common.Issue;
import org.runningdinner.common.IssueKeys;
import org.runningdinner.common.IssueList;
import org.runningdinner.common.IssueType;
import org.runningdinner.common.exception.ValidationException;
import org.runningdinner.common.service.LocalizationProviderService;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.core.RegistrationType;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.util.DateTimeUtil;
import org.runningdinner.mail.formatter.FormatterUtil;
import org.runningdinner.participant.Participant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

@Service
public class TeamPartnerWishStateHandlerService {
  
  @Autowired
  private MessageService messageService;
  
  @Autowired
  private UrlGenerator urlGenerator;

  @Autowired
  private MessageSource messageSource;

  @Autowired
  private LocalizationProviderService localizationProviderService;

  @Autowired
  private TeamPartnerWishService teamPartnerWishService;

  public void handleTeamPartnerWishForSubscribedParticipant(Participant participant, RunningDinner runningDinner) {

    if (runningDinner.getRegistrationType().isClosed() || runningDinner.getConfiguration().isTeamPartnerWishDisabled()) {
      return;
    }
    
    Optional<TeamPartnerWish> teamPartnerWishOptional = teamPartnerWishService.calculateTeamPartnerWishInfo(participant, runningDinner.getAdminId());
    if (!teamPartnerWishOptional.isPresent()) {
      return;
    }
    final Locale locale = localizationProviderService.getLocaleOfDinner(runningDinner);
    
    TeamPartnerWish teamPartnerWish = teamPartnerWishOptional.get();
    
    if (teamPartnerWish.getState() == TeamPartnerWishState.EXISTS_SAME_TEAM_PARTNER_WISH) {
      Participant matchingParticipant = teamPartnerWish.getMatchingParticipant();
        // Super happy flow (wished team partner is already registered with exactly the same wish):
      RunningDinnerRelatedMessage message = newConfirmationMessage(runningDinner, participant, matchingParticipant, locale);
      messageService.sendTeamPartnerWishMail(message, matchingParticipant.getEmail(), participant.getEmail());
    } else if (teamPartnerWish.getState() == TeamPartnerWishState.NOT_EXISTING) {
      // Happy flow: send email with invitation link
      sendTeamPartnerInvitationMessage(participant, runningDinner);
    } else if (teamPartnerWish.getState() == TeamPartnerWishState.EXISTS_EMPTY_TEAM_PARTNER_WISH) {
      // Semi-Happy-Flow: Versende Mail an diesen teilnehmer, dass der andere teilnehmer ihn gerne als partner hätte:
      // Damit muss der andere teilnehmer dies bestätigen
      RunningDinnerRelatedMessage message = newPartnerWishEmptyMessage(runningDinner, participant, teamPartnerWish.getMatchingParticipant(), locale);
      messageService.sendTeamPartnerWishMail(message, teamPartnerWish.getMatchingParticipant().getEmail(), participant.getEmail());
    } else if (teamPartnerWish.getState() == TeamPartnerWishState.EXISTS_OTHER_TEAM_PARTNER_WISH) {
      // Unhappy-Flow: Anderer Teilnehmer angemeldet, aber hat nen anderen Partner-Wunsch.. Mail an diesen Partner, mit Bitte sich zu entscheiden
      RunningDinnerRelatedMessage message = newPartnerWishConflictMessage(runningDinner, participant, teamPartnerWish.getMatchingParticipant(), locale);
      messageService.sendTeamPartnerWishMail(message, teamPartnerWish.getMatchingParticipant().getEmail(), participant.getEmail());
    } else if (teamPartnerWish.getState() == TeamPartnerWishState.NO_PARTNER_WISH_BUT_OTHER_TEAM_PARTNER_WISHES) {
      for (Participant otherParticipantWithThisPartnerWish : teamPartnerWish.getOtherParticipantsWithThisTeamPartnerWish()) {
        RunningDinnerRelatedMessage message = newOtherPartnerWishMessage(runningDinner, participant, otherParticipantWithThisPartnerWish, locale);
        messageService.sendTeamPartnerWishMail(message, participant.getEmail(), otherParticipantWithThisPartnerWish.getEmail());
      }
    }
  }
  
  public MessageJob sendTeamPartnerInvitationMessage(Participant participant, RunningDinner runningDinner) {
    
    Assert.state(!runningDinner.getRegistrationType().isClosed(), "Can only be called for non-closed dinner, but was not: " + runningDinner);
    final Locale locale = localizationProviderService.getLocaleOfDinner(runningDinner);
    RunningDinnerRelatedMessage message = newInvitationMessage(runningDinner, participant, locale);
    return messageService.sendTeamPartnerWishMail(message, participant.getTeamPartnerWish(), participant.getEmail());
  }
  
  private RunningDinnerRelatedMessage newPartnerWishConflictMessage(RunningDinner runningDinner, 
                                                                    Participant subscribedParticipant, 
                                                                    Participant alreadyRegisteredParticipant, 
                                                                    Locale locale) {

    String subject = messageSource.getMessage("message.subject.teampartnerwish.conflict", null, locale);
    String message = messageSource.getMessage("message.template.teampartnerwish.conflict", null, locale);
    
    RunningDinnerRelatedMessage tmpResult = newParnerWishConflictOrEmptyMessage(runningDinner, subscribedParticipant, alreadyRegisteredParticipant, subject, message);

    message = tmpResult.getMessage();
    message = message.replaceAll(FormatterUtil.TEAM_PARTNER_WISH_EMAIL, alreadyRegisteredParticipant.getTeamPartnerWish());
    return new RunningDinnerRelatedMessage(tmpResult.getSubject(), message, runningDinner);
  }


  private RunningDinnerRelatedMessage newPartnerWishEmptyMessage(RunningDinner runningDinner, 
                                                                 Participant subscribedParticipant,
                                                                 Participant alreadyRegisteredParticipant, 
                                                                 Locale locale) {
    
    String subject = messageSource.getMessage("message.subject.teampartnerwish.empty", null, locale);
    String message = messageSource.getMessage("message.template.teampartnerwish.empty", null, locale);
    return newParnerWishConflictOrEmptyMessage(runningDinner, subscribedParticipant, alreadyRegisteredParticipant, subject, message);
  }
  
  
  private RunningDinnerRelatedMessage newOtherPartnerWishMessage(RunningDinner runningDinner, 
                                                                 Participant participant, 
                                                                 Participant alreadySubscribedParticipantWithThisPartnerWish, 
                                                                 Locale locale) {

    
    String subject = replacePlaceholdersInSubject("message.subject.teampartnerwish.other", alreadySubscribedParticipantWithThisPartnerWish, runningDinner, locale);

    String message = messageSource.getMessage("message.template.teampartnerwish.other", null, locale);
    message = replaceCommonPlaceHoldersInMessage(message, alreadySubscribedParticipantWithThisPartnerWish, runningDinner);
    message = message.replaceAll(FormatterUtil.EMAIL, alreadySubscribedParticipantWithThisPartnerWish.getEmail());
    message = message.replaceAll(FormatterUtil.FULLNAME, participant.getName().getFullnameFirstnameFirst());

    String teamPartnerWishConfirmationLink = urlGenerator.constructTeamPartnerWishConfirmationUrl(runningDinner.getSelfAdministrationId(), 
                                                                                                  participant,
                                                                                                  alreadySubscribedParticipantWithThisPartnerWish.getEmail());
    
    message = message.replaceAll(FormatterUtil.TEAM_PARTNER_WISH_CONFIRMATION_LINK, teamPartnerWishConfirmationLink);

    return new RunningDinnerRelatedMessage(subject, message, runningDinner);
  }
  
  private RunningDinnerRelatedMessage newParnerWishConflictOrEmptyMessage(RunningDinner runningDinner, 
                                                                          Participant subscribedParticipant,
                                                                          Participant alreadyRegisteredParticipant, 
                                                                          String subjectTemplate, 
                                                                          String messageTemplate) {
    
    String date = DateTimeUtil.getDefaultFormattedDate(runningDinner.getDate(), runningDinner.getLanguageCode());
    
    String fullnameSubscribedParticipant = subscribedParticipant.getName().getFullnameFirstnameFirst();
    String fullnameAlreadyRegisteredParticipant = alreadyRegisteredParticipant.getName().getFullnameFirstnameFirst();
    
    String teamPartnerWishConfirmationLink = urlGenerator.constructTeamPartnerWishConfirmationUrl(runningDinner.getSelfAdministrationId(), 
                                                                                                  alreadyRegisteredParticipant,
                                                                                                  subscribedParticipant.getEmail());
    String subject = subjectTemplate;
    subject = subject.replaceAll(FormatterUtil.PARTNER, fullnameSubscribedParticipant);
    subject = subject.replaceAll(FormatterUtil.DATE, date);
    
    String message = replaceCommonPlaceHoldersInMessage(messageTemplate, subscribedParticipant, runningDinner);
    message = message.replaceAll(FormatterUtil.FULLNAME, fullnameAlreadyRegisteredParticipant);
    message = message.replaceAll(FormatterUtil.EMAIL, subscribedParticipant.getEmail());
    message = message.replaceAll(FormatterUtil.TEAM_PARTNER_WISH_CONFIRMATION_LINK, teamPartnerWishConfirmationLink);
    
    return new RunningDinnerRelatedMessage(subject, message, runningDinner);
  }
  
  private RunningDinnerRelatedMessage newConfirmationMessage(RunningDinner runningDinner, 
                                                             Participant subscribedParticipant, 
                                                             Participant invitingParticipant, 
                                                             Locale locale) {
  
    String subject = replacePlaceholdersInSubject("message.subject.teampartnerwish.confirmation", subscribedParticipant, runningDinner, locale) ;

    String message = messageSource.getMessage("message.template.teampartnerwish.confirmation", null, locale);
    message = replaceCommonPlaceHoldersInMessage(message, subscribedParticipant, runningDinner);
    message = message.replaceAll(FormatterUtil.FULLNAME, invitingParticipant.getName().getFullnameFirstnameFirst());
    
    message = addOrRemoveMissingSubscriptionNote(message, invitingParticipant, runningDinner, locale);
    
    return new RunningDinnerRelatedMessage(subject, message, runningDinner);
  }
  
  private String addOrRemoveMissingSubscriptionNote(String message, Participant participant, RunningDinner runningDinner, Locale locale) {

    if (!participant.isActivated()) {
      String subscriptionActivationissingNote = messageSource.getMessage("message.template.teampartnerwish.confirmation.subscription_activation_missing_note", null, locale);
      String participantActivationUrl = urlGenerator.constructParticipantActivationUrl(runningDinner.getPublicSettings().getPublicId(), participant.getId());
      subscriptionActivationissingNote = subscriptionActivationissingNote.replaceAll(FormatterUtil.ACTIVATE_PARTICIPANT_SUBSCRIPTION_LINK, participantActivationUrl);
      message = message.replaceAll(FormatterUtil.SUBSCRIPTION_ACTIVATION_MISSING_NOTE, subscriptionActivationissingNote);
    } else {
      message = message.replaceAll(FormatterUtil.SUBSCRIPTION_ACTIVATION_MISSING_NOTE, StringUtils.EMPTY);
    }
    return message;
  }

  private RunningDinnerRelatedMessage newInvitationMessage(RunningDinner runningDinner, Participant invitingParticipant, Locale locale) {

    String registrationLink = urlGenerator.constructPublicDinnerRegistrationUrl(runningDinner.getPublicSettings().getPublicId(), 
                                                                                invitingParticipant.getEmail(),
                                                                                invitingParticipant.getTeamPartnerWish());
    
    String subject = replacePlaceholdersInSubject("message.subject.teampartnerwish.invitation", invitingParticipant, runningDinner, locale) ;
    
    String message = messageSource.getMessage("message.template.teampartnerwish.invitation", null, locale);
    message = replaceCommonPlaceHoldersInMessage(message, invitingParticipant, runningDinner);
    message = message.replaceAll(FormatterUtil.EMAIL, invitingParticipant.getEmail());
    message = message.replaceAll(FormatterUtil.REGISTRATION_LINK, registrationLink);
    
    return new RunningDinnerRelatedMessage(subject, message, runningDinner);
  }
  
  private String replacePlaceholdersInSubject(final String subjectI18nKey, 
                                              final Participant partner, 
                                              final RunningDinner runningDinner,
                                              final Locale locale) {
    
    String date = DateTimeUtil.getDefaultFormattedDate(runningDinner.getDate(), runningDinner.getLanguageCode());
    
    String result = messageSource.getMessage(subjectI18nKey, null, locale);
    result = result.replaceAll(FormatterUtil.PARTNER, partner.getName().getFullnameFirstnameFirst());
    result = result.replaceAll(FormatterUtil.DATE, date);
    return result;
  }
  
  private String replaceCommonPlaceHoldersInMessage(String messageTemplate, Participant partner, RunningDinner runningDinner) {
    
    String date = DateTimeUtil.getDefaultFormattedDate(runningDinner.getDate(), runningDinner.getLanguageCode());
    String city = runningDinner.getCity();
    String title = getTitle(runningDinner);
    String fullname = partner.getName().getFullnameFirstnameFirst();

    String result = messageTemplate;
    result = result.replaceAll(FormatterUtil.PARTNER, fullname);
    result = result.replaceAll(FormatterUtil.DATE, date);
    result = result.replaceAll(FormatterUtil.CITY, city);
    result = result.replaceAll(FormatterUtil.TITLE, title);
    return result;
  }
  
  public static void checkEmailDoesNotEqualTeamPartnerWish(Participant participant) {
  
    if (StringUtils.isNotEmpty(participant.getTeamPartnerWish()) && StringUtils.isNotEmpty(participant.getEmail())) {
      if (participant.getEmail().equalsIgnoreCase(participant.getTeamPartnerWish())) {
        throw new ValidationException(new IssueList(new Issue("teamPartnerWish", IssueKeys.PARTICIPANT_EMAIL_EQUALS_TEAM_PARTNER_WISH, IssueType.VALIDATION)));
      }
    }
  }

  private static String getTitle(RunningDinner runningDinner) {
    
    if (runningDinner.getRegistrationType() == RegistrationType.CLOSED) {
      return runningDinner.getTitle();
    }
    return runningDinner.getPublicSettings().getPublicTitle();
  }
  
}
