
package org.runningdinner.mail.formatter;

import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.AfterPartyLocationService;
import org.runningdinner.common.service.LocalizationProviderService;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.util.CoreUtil;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

@Component
public class TeamArrangementMessageFormatter {

  @Autowired
  UrlGenerator urlGenerator;

  @Autowired
  MessageSource messageSource;

  @Autowired
  LocalizationProviderService localizationProviderService;
  
  @Autowired
  AfterPartyLocationService afterPartyLocationService;

  @Autowired
  MessageFormatterHelperService messageFormatterHelperService;

  public String formatTeamMemberMessage(RunningDinner runningDinner, Participant teamMember, Team parentTeam, TeamArrangementTextMessage teamArrangementTextMessage) {

    Locale locale = localizationProviderService.getLocaleOfDinner(runningDinner);
    DateTimeFormatter timeFormat = localizationProviderService.getTimeFormatterOfDinner(runningDinner);

    String hostMessagePartTemplate = teamArrangementTextMessage.getHostMessagePartTemplate();
    String nonHostMessagePartTemplate = teamArrangementTextMessage.getNonHostMessagePartTemplate();
    String theMessage = teamArrangementTextMessage.getMessage();
    Assert.state(StringUtils.isNotEmpty(hostMessagePartTemplate), "Hosting part template must not be empty!");
    Assert.state(StringUtils.isNotEmpty(nonHostMessagePartTemplate), "Non Hosting part template must not be empty!");
    Assert.state(StringUtils.isNotEmpty(theMessage), "Message template must not be empty!");

    final String noTimeText = messageSource.getMessage("message.template.no.time", null, locale);
    final String noEmailText = messageSource.getMessage("message.template.no.email", null, locale);
    final String noMobileText = messageSource.getMessage("message.template.no.mobile", null, locale);
    final String mobileLabel = messageSource.getMessage("mobile", null, locale);
    final String emailLabel = messageSource.getMessage("email", null, locale);

    theMessage = theMessage.replaceAll(FormatterUtil.FIRSTNAME, teamMember.getName().getFirstnamePart());
    theMessage = theMessage.replaceAll(FormatterUtil.LASTNAME, teamMember.getName().getLastname());
    theMessage = theMessage.replaceAll(FormatterUtil.MEAL, parentTeam.getMealClass().getLabel());
    theMessage = theMessage.replaceAll(FormatterUtil.MEALTIME, FormatterUtil.getFormattedTime(parentTeam.getMealClass().getTime(), timeFormat, noTimeText));

    theMessage = afterPartyLocationService.replaceAfterPartyLocationTemplate(theMessage, runningDinner);
    
    Set<Participant> partners = CoreUtil.excludeFromSet(teamMember, parentTeam.getTeamMembers());

    int cnt = 0;
    StringBuilder partnerInfo = new StringBuilder();
    for (Participant partner : partners) {

      if (cnt++ > 0) {
        partnerInfo.append(FormatterUtil.TWO_NEWLINES).append(FormatterUtil.NEWLINE);
      }

      String partnerName = partner.getName().getFullnameFirstnameFirst();
      String partnerMail = emailLabel + ": " + StringUtils.defaultIfEmpty(partner.getEmail(), noEmailText);
      String partnerMobile = mobileLabel + ": " + StringUtils.defaultIfEmpty(partner.getMobileNumber(), noMobileText);

      String address = FormatterUtil.generateAddressString(partner);
      partnerInfo
        .append(partnerName).append(FormatterUtil.NEWLINE)
        .append(address).append(FormatterUtil.NEWLINE)
        .append(partnerMail).append(FormatterUtil.NEWLINE)
        .append(partnerMobile);
      
      if (partner.getMealSpecifics().isOneSelected()) {
        partnerInfo.append(FormatterUtil.NEWLINE);
        String mealsepcificsText = messageSource.getMessage("message.template.teampartner.mealspecifics", null, locale);
        mealsepcificsText = mealsepcificsText.replaceAll(FormatterUtil.MEALSPECIFICS,
            messageFormatterHelperService.formatMealSpecificItems(partner.getMealSpecifics(), locale));
        partnerInfo.append(mealsepcificsText);
      }
      if (StringUtils.isNotEmpty(partner.getMealSpecifics().getMealSpecificsNote())) {
        partnerInfo.append(FormatterUtil.NEWLINE);
        String mealsepcificsNoteText = messageSource.getMessage("message.template.teampartner.mealspecifics-note", null, locale);
        mealsepcificsNoteText = mealsepcificsNoteText.replaceAll(FormatterUtil.MEALSPECIFICS_NOTE, partner.getMealSpecifics().getMealSpecificsNote());
        partnerInfo.append(mealsepcificsNoteText);
      }
    }
    theMessage = theMessage.replaceFirst(FormatterUtil.PARTNER, partnerInfo.toString());

    Participant hostMember = parentTeam.getHostTeamMember();
    String hostReplacement;
    if (teamMember.equals(hostMember)) {
      hostReplacement = hostMessagePartTemplate;
    } else {
      hostReplacement = nonHostMessagePartTemplate;
    }

    hostReplacement = hostReplacement.replaceAll(FormatterUtil.PARTNER, hostMember.getName().getFullnameFirstnameFirst());
    theMessage = theMessage.replaceAll(FormatterUtil.HOST, hostReplacement);

    final String manageHostLink = urlGenerator.constructManageTeamHostUrl(runningDinner.getSelfAdministrationId(), parentTeam.getId(), teamMember.getId());
    theMessage = theMessage.replaceAll(FormatterUtil.MANGE_HOST_LINK, manageHostLink);

    return theMessage;
  }

  public void setUrlGenerator(UrlGenerator urlGenerator) {

    this.urlGenerator = urlGenerator;
  }

  public void setMessageSource(MessageSource messageSource) {

    this.messageSource = messageSource;
  }
}
