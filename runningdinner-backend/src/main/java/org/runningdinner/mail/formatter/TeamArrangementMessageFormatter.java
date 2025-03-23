
package org.runningdinner.mail.formatter;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.AfterPartyLocationService;
import org.runningdinner.common.service.LocalizationProviderService;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.core.MealSpecifics;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.util.CoreUtil;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

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

    String relevantMealSpecifics = this.messageFormatterHelperService.formatMealSpecificsTeamMessagesUnified(getRelevantMealSpecifics(parentTeam),
        runningDinner);
    if (StringUtils.isEmpty(relevantMealSpecifics)) {
      theMessage = theMessage.replaceAll("\n?" + FormatterUtil.MEALSPECIFICS + "\n?", StringUtils.EMPTY);
    } else {
      theMessage = theMessage.replaceAll(FormatterUtil.MEALSPECIFICS, relevantMealSpecifics);
    }
    int cnt = 0;
    StringBuilder partnerInfo = new StringBuilder();
    for (Participant partner : partners) {

      if (cnt++ > 0) {
        partnerInfo.append(FormatterUtil.TWO_NEWLINES).append(FormatterUtil.NEWLINE);
      }

      String partnerName = partner.getName().getFullnameFirstnameFirst();
      String partnerMail = emailLabel + ": " + StringUtils.defaultIfEmpty(partner.getEmail(), noEmailText);
      String partnerMobile = mobileLabel + ": " + StringUtils.defaultIfEmpty(partner.getMobileNumber(), noMobileText);

      partnerInfo.append(partnerName).append(FormatterUtil.NEWLINE);
      // Root participant will always have same address as child participant => only send partner address if it's not a child registration
      String address = FormatterUtil.generateAddressString(partner);
      if (!partner.isTeamPartnerWishRegistratonChild()) {
        partnerInfo.append(address).append(FormatterUtil.NEWLINE);
      }
      partnerInfo.append(partnerMail).append(FormatterUtil.NEWLINE)
                 .append(partnerMobile);
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

  private List<MealSpecifics> getRelevantMealSpecifics(Team parentTeam) {
    List<MealSpecifics> result = new ArrayList<>(parentTeam.getMealSpecificsOfGuestTeams());
    List<Participant> teamMembers = parentTeam.getTeamMembersOrdered();
    for (Participant teamMember : teamMembers) {
      result.add(teamMember.getMealSpecifics());
    }
    return result;
  }

  public void setUrlGenerator(UrlGenerator urlGenerator) {

    this.urlGenerator = urlGenerator;
  }

  public void setMessageSource(MessageSource messageSource) {

    this.messageSource = messageSource;
  }
}
