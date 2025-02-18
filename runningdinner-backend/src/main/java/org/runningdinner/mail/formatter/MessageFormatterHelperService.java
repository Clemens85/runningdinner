package org.runningdinner.mail.formatter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.apache.commons.collections4.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.common.service.LocalizationProviderService;
import org.runningdinner.core.MealSpecifics;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Team;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Service;

@Service
public class MessageFormatterHelperService {

  private LocalizationProviderService localizationProviderService;

  private MessageSource messageSource;

  public MessageFormatterHelperService(LocalizationProviderService localizationProviderService,
      MessageSource messageSource) {
    this.localizationProviderService = localizationProviderService;
    this.messageSource = messageSource;
  }


  public String formatMealSpecificsTeamMessagesUnified(List<MealSpecifics> allMealSpecifics, RunningDinner runningDinner) {
    return formatMealSpecificsUnified(allMealSpecifics, "message.template.teams.mealspecifics", "message.template.teams.mealspecifics-note", runningDinner);
  }

  public String formatMealSpecificsDinnerRouteMessagesUnified(List<MealSpecifics> allGuestMealspecifics, RunningDinner runningDinner) {
    return formatMealSpecificsUnified(allGuestMealspecifics, "message.template.dinnerroute.mealspecifics", "message.template.dinnerroute.mealspecifics-note", runningDinner);
  }

  private String formatMealSpecificsUnified(List<MealSpecifics> allGuestMealspecifics,
                                            String mealSpecificsTemplate,
                                            String mealSpecificsNoteTemplate,
                                            RunningDinner runningDinner) {

    if (CollectionUtils.isEmpty(allGuestMealspecifics)) {
      return StringUtils.EMPTY;
    }

    Locale locale = localizationProviderService.getLocaleOfDinner(runningDinner);

    MealSpecifics resultingMealSpecifics = new MealSpecifics();
    for (MealSpecifics guestMealspecifics : allGuestMealspecifics) {
      resultingMealSpecifics.unionWith(guestMealspecifics);
    }

    final String mealSpecificsNotes = getMealSpecificsNotes(allGuestMealspecifics);

    String result = StringUtils.EMPTY;
    if (resultingMealSpecifics.isOneSelected()) {
      result = messageSource.getMessage(mealSpecificsTemplate, null, locale);
      result = result.replaceAll(FormatterUtil.MEALSPECIFICS, formatMealSpecificItems(resultingMealSpecifics, locale));
    }
    if (StringUtils.isNotEmpty(mealSpecificsNotes)) {
      if (resultingMealSpecifics.isOneSelected()) {
        result += FormatterUtil.NEWLINE;
      }
      String mealSepcificsNotesText = messageSource.getMessage(mealSpecificsNoteTemplate, null,
          locale);
      mealSepcificsNotesText = mealSepcificsNotesText.replaceAll(FormatterUtil.MEALSPECIFICS_NOTE, mealSpecificsNotes);
      result += mealSepcificsNotesText;
    }

    return result;

  }

  public String formatMealSpecificItems(MealSpecifics mealSpecifics, Locale locale) {

    StringBuilder result = new StringBuilder();
    if (mealSpecifics.isVegan()) {
      result.append(translateMealSpecificItem("vegan", locale));
    }
    if (mealSpecifics.isVegetarian()) {
      result.append(translateMealSpecificItem("vegetarian", locale));
    }
    if (mealSpecifics.isLactose()) {
      result.append(translateMealSpecificItem("lactose", locale));
    }
    if (mealSpecifics.isGluten()) {
      result.append(translateMealSpecificItem("gluten", locale));
    }
    if (!result.isEmpty()) {
      return result.substring(0, result.length() - 2);
    }
    return StringUtils.EMPTY;
  }

  private String translateMealSpecificItem(String item, Locale locale) {

    return messageSource.getMessage(item, null, locale) + ", ";
  }

  public String generateHostCancelledMessage(Team team, Locale locale, DateTimeFormatter timeFormat,
      String noTimeText) {

    LocalDateTime mealTime = team.getMealClass().getTime();
    String mealLabel = team.getMealClass().getLabel();
    String cancelledMealTimeInfo = messageSource.getMessage("teamhost.cancelled.mealtime.info",
        new String[] { FormatterUtil.getFormattedTime(mealTime, timeFormat, noTimeText) }, locale);
    return mealLabel + " " + cancelledMealTimeInfo;
  }

  private static String getMealSpecificsNotes(List<MealSpecifics> mealSpecificsList) {

    List<String> notes = mealSpecificsList
        .stream()
        .map(MealSpecifics::getMealSpecificsNote)
        .filter(StringUtils::isNotBlank)
        .toList();

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


}
