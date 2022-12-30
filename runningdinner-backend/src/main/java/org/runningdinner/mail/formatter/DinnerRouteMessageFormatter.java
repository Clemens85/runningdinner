package org.runningdinner.mail.formatter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.AfterPartyLocationService;
import org.runningdinner.common.service.LocalizationProviderService;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.core.MealSpecifics;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.dinnerplan.TeamRouteBuilder;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

@Component
public class DinnerRouteMessageFormatter {

  private UrlGenerator urlGenerator;

  private MessageSource messageSource;

  private LocalizationProviderService localizationProviderService;

  private AfterPartyLocationService afterPartyLocationService;
	
  @Autowired
  public DinnerRouteMessageFormatter(UrlGenerator urlGenerator, 
	                                 MessageSource messageSource, 
	                                 LocalizationProviderService localizationProviderService, 
	                                 AfterPartyLocationService afterPartyLocationService) {
    this.urlGenerator = urlGenerator;
    this.messageSource = messageSource;
    this.localizationProviderService = localizationProviderService;
    this.afterPartyLocationService = afterPartyLocationService;
  }

  public String formatDinnerRouteMessage(final RunningDinner runningDinner, final Participant teamMember,
      final Team parentTeam, final List<Team> dinnerRoute,
      final DinnerRouteTextMessage dinnerRouteTextMessage) {

    Locale locale = localizationProviderService.getUserLocale();
    DateTimeFormatter timeFormat = localizationProviderService.getTimeFormatter();

    String hostsTemplate = dinnerRouteTextMessage.getHostsTemplate();
    String selfTemplate = dinnerRouteTextMessage.getSelfTemplate();
    String theMessage = dinnerRouteTextMessage.getMessage();
    Assert.state(StringUtils.isNotEmpty(selfTemplate), "Self part template must not be empty!");
    Assert.state(StringUtils.isNotEmpty(hostsTemplate), "Hosts part template must not be empty!");
    Assert.state(StringUtils.isNotEmpty(theMessage), "Message template must not be empty!");

    final String noTimeText = messageSource.getMessage("message.template.no.time", null, locale);
    final String noMobileText = messageSource.getMessage("message.template.no.mobile", null, locale);

    theMessage = theMessage.replaceAll(FormatterUtil.FIRSTNAME, teamMember.getName().getFirstnamePart());
    theMessage = theMessage.replaceAll(FormatterUtil.LASTNAME, teamMember.getName().getLastname());
    String routeLink = urlGenerator.constructPrivateDinnerRouteUrl(runningDinner.getSelfAdministrationId(), parentTeam.getId(), teamMember.getId());
    theMessage = theMessage.replaceAll(FormatterUtil.ROUTELINK, routeLink);

    theMessage = afterPartyLocationService.replaceAfterPartyLocationTemplate(theMessage, runningDinner);

    final int dinnerRouteSize = dinnerRoute.size();

    StringBuilder plan = new StringBuilder();
    int cnt = 0;
    for (Team dinnerRouteTeam : dinnerRoute) {

      Participant hostTeamMember = dinnerRouteTeam.getHostTeamMember();

      String mealLabel = dinnerRouteTeam.getMealClass().getLabel();
      LocalDateTime mealTime = dinnerRouteTeam.getMealClass().getTime();

      // The plan-part for the team of the participant to which to send this message:
      if (dinnerRouteTeam.equals(parentTeam)) {
        String self = selfTemplate;
        self = self.replaceAll(FormatterUtil.FIRSTNAME, hostTeamMember.getName().getFirstnamePart());
        self = self.replaceAll(FormatterUtil.LASTNAME, hostTeamMember.getName().getLastname());
        self = self.replaceAll(FormatterUtil.MEAL, mealLabel);
        self = self.replaceAll(FormatterUtil.MEALTIME,
            FormatterUtil.getFormattedTime(mealTime, timeFormat, noTimeText));
        String mealSpecificsOfGuestTeams = getMealSpecificsOfGuestTeams(parentTeam, locale);
        self = self.replaceAll(FormatterUtil.MEALSPECIFICS, mealSpecificsOfGuestTeams);
        if (StringUtils.isEmpty(mealSpecificsOfGuestTeams) /* && (self.endsWith("\\n") || self.endsWith("\\r")) */) {
          // TODO: Don't know why if check with new line doesnt work
          self = StringUtils.chop(self); // prevent unnecessary newline
        }
        plan.append(self);
      }
      // The plan-part(s) for the host-teams:
      else {
        String host = hostsTemplate;
        if (dinnerRouteTeam.getStatus() != TeamStatus.CANCELLED) {
          host = host.replaceAll(FormatterUtil.FIRSTNAME, hostTeamMember.getName().getFirstnamePart());
          host = host.replaceAll(FormatterUtil.LASTNAME, hostTeamMember.getName().getLastname());
          host = host.replaceAll(FormatterUtil.MEAL, mealLabel);
          host = host.replaceAll(FormatterUtil.MEALTIME,
              FormatterUtil.getFormattedTime(mealTime, timeFormat, noTimeText));

          String address = FormatterUtil.generateAddressString(hostTeamMember);
          host = host.replaceFirst(FormatterUtil.HOSTADDRESS, address);

          String mobileNumberStr = TeamRouteBuilder.getMobileNumbersCommaSeparated(dinnerRouteTeam);
          mobileNumberStr = StringUtils.defaultIfEmpty(mobileNumberStr, noMobileText);
          host = host.replaceAll(FormatterUtil.MOBILENUMBER, mobileNumberStr);
        } else {
          host = generateHostCancelledMessage(dinnerRouteTeam, locale, timeFormat, noTimeText);
        }

        plan.append(host);
      }

      if (++cnt < dinnerRouteSize) {
        plan.append(FormatterUtil.TWO_NEWLINES);
        plan.append(FormatterUtil.NEWLINE);
      }
    }

    theMessage = theMessage.replaceFirst(FormatterUtil.ROUTE, plan.toString());

    return theMessage;

  }

  public String getMealSpecificsOfGuestTeams(Team parentTeam, Locale locale) {

    List<MealSpecifics> allGuestMealspecifics = parentTeam.getMealSpecificsOfGuestTeams();

    if (CollectionUtils.isEmpty(allGuestMealspecifics)) {
      return StringUtils.EMPTY;
    }

    MealSpecifics resultingMealSpecifics = new MealSpecifics();
    for (MealSpecifics guestMealspecifics : allGuestMealspecifics) {
      resultingMealSpecifics.unionWith(guestMealspecifics);
    }

    final String mealSpecificsNotes = getMealSpecificsNotes(allGuestMealspecifics);

    String result = StringUtils.EMPTY;
    if (resultingMealSpecifics.isOneSelected()) {
      result = messageSource.getMessage("message.template.dinnerroute.mealspecifics", null, locale);
      result = result.replaceAll(FormatterUtil.MEALSPECIFICS, resultingMealSpecifics.toCommaSeparatedString());
    }
    if (StringUtils.isNotEmpty(mealSpecificsNotes)) {
      if (resultingMealSpecifics.isOneSelected()) {
        result += FormatterUtil.NEWLINE;
      }
      String mealSepcificsNotesText = messageSource.getMessage("message.template.dinnerroute.mealspecifics-note", null,
          locale);
      mealSepcificsNotesText = mealSepcificsNotesText.replaceAll(FormatterUtil.MEALSPECIFICS_NOTE, mealSpecificsNotes);
      result += mealSepcificsNotesText;
    }

    return result;
  }

  private static String getMealSpecificsNotes(List<MealSpecifics> mealSpecificsList) {

    List<String> notes = mealSpecificsList
                          .stream()
                          .map(MealSpecifics::getNote)
                          .filter(StringUtils::isNotBlank)
                          .collect(Collectors.toList());
    
    StringBuilder result = new StringBuilder();
    int cnt = 0;
    for (String note : notes) {
      if (cnt++ > 0) {
        result.append(FormatterUtil.NEWLINE);
      }
      result.append(note);
    }

    return result.toString();
  }

  public void setUrlGenerator(UrlGenerator urlGenerator) {
    this.urlGenerator = urlGenerator;
  }

  public void setMessageSource(MessageSource messageSource) {
    this.messageSource = messageSource;
  }

  private static String generateHostCancelledMessage(Team team, Locale locale, DateTimeFormatter timeFormat,
      String noTimeText) {

    LocalDateTime mealTime = team.getMealClass().getTime();
    String mealLabel = team.getMealClass().getLabel();
    return mealLabel + " (" + FormatterUtil.getFormattedTime(mealTime, timeFormat, noTimeText) + " Uhr) ENTFÄLLT";
  }

}
