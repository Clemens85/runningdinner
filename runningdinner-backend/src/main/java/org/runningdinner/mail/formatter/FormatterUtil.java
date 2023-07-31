
package org.runningdinner.mail.formatter;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Set;

import org.apache.commons.lang3.RegExUtils;
import org.apache.commons.lang3.StringUtils;
import org.runningdinner.core.util.CoreUtil;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Util class that is used for formatting email messages
 * 
 * @author Clemens Stich
 * 
 */
public class FormatterUtil {

  private static final Logger LOGGER = LoggerFactory.getLogger(FormatterUtil.class);
  
  public static final String PARTNER = "\\{partner\\}";

  public static final String FIRSTNAME = "\\{firstname\\}";
  public static final String LASTNAME = "\\{lastname\\}";
  public static final String FULLNAME = "\\{fullname\\}";
  public static final String EMAIL = "\\{email\\}";
  
  public static final String DATE = "\\{date\\}";
  public static final String CITY = "\\{city\\}";
  public static final String TITLE = "\\{title\\}";
  
  public static final String REGISTRATION_LINK = "\\{registrationlink\\}";
  public static final String TEAM_PARTNER_WISH_CONFIRMATION_LINK = "\\{teampartnerwish-confirmation-link\\}";
  public static final String TEAM_PARTNER_WISH_EMAIL = "\\{teampartnerwish-email\\}";
  
  public static final String SUBSCRIPTION_ACTIVATION_MISSING_NOTE = "\\{subscription-activation-missing-note\\}";
  
  public static final String MEAL = "\\{meal\\}";
  public static final String MEALTIME = "\\{mealtime\\}";
  public static final String HOST = "\\{host\\}";

  public static final String PARTNER_MESSAGE = "\\{partnermessage\\}";
  public static final String ARRANGEMENT = "\\{arrangement\\}";
  public static final String MANGE_HOST_LINK = "\\{managehostlink\\}";

  public static final String ROUTE = "\\{route\\}";
  public static final String ROUTELINK = "\\{routelink\\}";
  public static final String HOSTADDRESS = "\\{hostaddress\\}";
  public static final String MOBILENUMBER = "\\{mobilenumber\\}";
  
  public static final String PUBLIC_RUNNING_DINNER_TITLE = "\\{publicRunningDinnerTitle\\}";
  public static final String ACTIVATE_PARTICIPANT_SUBSCRIPTION_LINK = "\\{activateParticipantSubscriptionLink\\}";
  
  public static final String NEWLINE = "\r\n";
  public static final String TWO_NEWLINES = NEWLINE + NEWLINE;

  public static final String ADMIN_RUNNINGDINNER_LINK = "\\{adminRunningDinnerLink\\}";
  public static final String ACKNOWLEDGE_RUNNINGDINNER_LINK = "\\{acknowledgeRunningDinnerLink\\}";

  public static final String MEALSPECIFICS = "\\{mealspecifics\\}";
  public static final String MEALSPECIFICS_NOTE = "\\{mealspecifics-note\\}";

  public static final String AFTER_PARTY_LOCATION = "\\{afterparty\\}";

  public static final String PAYMENT_OPTIONS_BRAND_NAME = "\\{brandName\\}";
  public static final String TEAM_PARTNER_IFNO = "\\{teampartnerinfo\\}";
  
  private FormatterUtil() {
    // NOP
  }
  
  /**
   * Returns a comma separated string with all members of the passed team
   * 
   * @param team
   * @return
   */
  public static String generateParticipantNamesWithCommas(Team team) {

    return generateParticipantNames(team, ", ");
  }

  private static String generateParticipantNames(Team team, String delimiter) {

    StringBuilder result = new StringBuilder();
    int cnt = 0;
    for (Participant teamMember : team.getTeamMembers()) {
      if (cnt++ > 0) {
        result.append(delimiter);
      }
      String fullname = teamMember.getName().getFullnameFirstnameFirst();
      result.append(fullname);
    }
    return result.toString();
  }

  /**
   * Generates a string with the number of the passed team and its team-members
   * 
   * @param team
   * @return
   */
  public static String generateTeamLabel(Team team) {

    String result = "Team " + team.getTeamNumber();
    Set<Participant> teamMembers = team.getTeamMembers();
    if (CoreUtil.isEmpty(teamMembers)) {
      return result;
    }
    result += " (";
    result += generateParticipantNamesWithCommas(team);
    result += ")";
    return result;
  }
  
  public static String generateAddressString(Participant participant) {
    
    String result = participant.getAddress().getStreetWithNr() + FormatterUtil.NEWLINE + participant.getAddress().getZipWithCity();
    if (StringUtils.isNotEmpty(participant.getAddress().getRemarks())) {
      result += FormatterUtil.NEWLINE + participant.getAddress().getRemarks();
    }
    return result;
  }
  
  /**
   * Takes the given input string and formats it as html escaped message
   * 
   * @param inputMessage
   * @return
   */
  public static String getHtmlFormattedMessage(final String inputMessage) {

    String htmlMessage = inputMessage; // HtmlUtils.htmlEscape(inputMessage);
    htmlMessage = RegExUtils.replaceAll(htmlMessage, NEWLINE, "<br/>");
    htmlMessage = RegExUtils.replaceAll(htmlMessage, "\n", "<br/>");
    htmlMessage = RegExUtils.replaceAll(htmlMessage, "\r", "<br/>");
    return htmlMessage;
  }

  /**
   * Safely returns a formatted date string.
   * 
   * @param time The date to format
   * @param timeFormat The dateformat which shall be used for formatting
   * @param fallback The fallback to return if the date cannot be formatted
   * @return
   */
  public static String getFormattedTime(final LocalDateTime time, final DateTimeFormatter timeFormatter, final String fallback) {

    if (time == null) {
      return fallback;
    }
    try {
      return time.format(timeFormatter);
    } catch (Exception ex) {
      LOGGER.error("Failed to format time-string {}", time, ex);
      return fallback;
    }
  }
}
