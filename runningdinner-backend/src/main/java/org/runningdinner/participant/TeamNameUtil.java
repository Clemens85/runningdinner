package org.runningdinner.participant;

import java.text.Normalizer;
import java.util.regex.Pattern;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.common.Issue;
import org.runningdinner.common.IssueKeys;
import org.runningdinner.common.IssueList;
import org.runningdinner.common.IssueType;
import org.runningdinner.common.exception.ValidationException;
import org.springframework.web.util.HtmlUtils;

/**
 * Normalization, validation and output formatting of custom team names.<br>
 * Allowed: letters of any language, digits, spaces and a few punctuation characters. Must start with a letter or digit.<br>
 * This is the only place where team names are validated (the client shows the resulting validation issue at the form field).
 */
public final class TeamNameUtil {

  public static final int MAX_LENGTH = 48;

  private static final Pattern VALID_TEAM_NAME = Pattern.compile("^[\\p{L}\\p{M}\\p{N}][\\p{L}\\p{M}\\p{N} _!?.'/&\\-]*$");

  private static final Pattern WHITESPACE = Pattern.compile("\\s+");

  private TeamNameUtil() {
    // Utility
  }

  /**
   * Trims, collapses whitespace and normalizes (NFC) the passed raw team name.
   * 
   * @return The normalized name or null if there is no name left after normalization
   */
  public static String normalize(String rawTeamName) {

    if (rawTeamName == null) {
      return null;
    }
    String result = Normalizer.normalize(rawTeamName, Normalizer.Form.NFC);
    result = WHITESPACE.matcher(result).replaceAll(" ");
    return StringUtils.trimToNull(result);
  }

  /**
   * @param normalizedTeamName Result of {@link #normalize(String)}
   * @return true if the passed name is either empty (meaning no custom name) or valid
   */
  public static boolean isValid(String normalizedTeamName) {

    if (normalizedTeamName == null) {
      return true;
    }
    return normalizedTeamName.length() <= MAX_LENGTH && VALID_TEAM_NAME.matcher(normalizedTeamName).matches();
  }

  /**
   * Normalizes and validates the passed name.
   * 
   * @return The name to be stored or null if the team shall have no custom name
   * @throws ValidationException If the name contains invalid characters or is too long
   */
  public static String normalizeAndValidate(String rawTeamName) {

    String result = normalize(rawTeamName);
    if (!isValid(result)) {
      throw new ValidationException(new IssueList(new Issue("teamName", IssueKeys.TEAM_NAME_INVALID, IssueType.VALIDATION)));
    }
    return result;
  }

  /**
   * @return The team name of the passed team (HTML escaped) or an empty string if the team has no custom name
   */
  public static String getTeamNameHtmlEscaped(Team team) {

    return team.hasTeamName() ? HtmlUtils.htmlEscape(team.getTeamName()) : StringUtils.EMPTY;
  }
}
