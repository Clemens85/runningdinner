package org.runningdinner.admin.message.proposal;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.message.BaseMessage;
import org.runningdinner.admin.message.dinnerroute.DinnerRouteMessage;
import org.runningdinner.admin.message.job.MessageType;
import org.runningdinner.admin.message.participant.ParticipantMessage;
import org.runningdinner.admin.message.team.TeamMessage;
import org.runningdinner.core.AfterPartyLocation;
import org.runningdinner.core.PublicSettings;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.util.DateTimeUtil;
import org.runningdinner.mail.formatter.FormatterUtil;

public final class ProposalExampleGenerator {

  public static final String EVENT_DESCRIPTIONS_INPUT_PREFIX = "input/EVENT_DESCRIPTION";
  public static final String MESSAGES_INPUT_PREFIX = "input/message";

  private ProposalExampleGenerator() {
    // Utility class
  }

  public static ProposalExample newEventDescriptionProposalExample(RunningDinner runningDinner) {
    final PublicSettings publicSettings = runningDinner.getPublicSettings();
    StringBuilder textContent = new StringBuilder("# " + publicSettings.getPublicTitle()).append(FormatterUtil.NEWLINE)
				.append(getLocationInfo(runningDinner))
				.append(FormatterUtil.TWO_NEWLINES)
				.append("## Ablauf").append(FormatterUtil.NEWLINE)
				.append(getScheduleInfo(runningDinner))
				.append(FormatterUtil.TWO_NEWLINES)
				.append("## Beschreibung").append(FormatterUtil.NEWLINE)
        .append(publicSettings.getPublicDescription());

    if (runningDinner.getAfterPartyLocation().isPresent()) {
      textContent.append(FormatterUtil.TWO_NEWLINES);
      final AfterPartyLocation afterPartyLocation = runningDinner.getAfterPartyLocation().get();
			textContent.append(getAfterPartyInfo(afterPartyLocation, runningDinner.getLanguageCode()));
    }

    return new ProposalExample(
        mapEventDescriptionPath(runningDinner),
        textContent.toString()
    );
  }

	/**
	 * Return meals with their times as a formatted string as list, like e.g. so:<br/>
	 *   17:30 Uhr: Vorspeise<br/>
	 *   19:00 Uhr: Hauptgang<br/>
	 *   21:00 Uhr: Dessert<br/>
	 */
	private static String getScheduleInfo(RunningDinner runningDinner) {

    StringBuilder scheduleInfo = new StringBuilder();
    runningDinner.getConfiguration().getMealClasses().forEach(meal -> {
      if (!scheduleInfo.isEmpty()) {
        scheduleInfo.append(FormatterUtil.NEWLINE);
      }
			String timeFormatted = null;
			if (meal.getTime() != null) {
				timeFormatted = DateTimeUtil.getDefaultFormattedTime(meal.getTime(), runningDinner.getLanguageCode()) + " Uhr";
			}
      scheduleInfo.append(timeFormatted)
                  .append(": ")
                  .append(meal.getLabel());
    });
    return scheduleInfo.toString();
	}

	/**
	 * Return after party information as formatted string
	 */
	private static String getAfterPartyInfo(AfterPartyLocation afterPartyLocation, String languageCode) {
		StringBuilder result = new StringBuilder();

		result.append("### ").append(afterPartyLocation.getTitle());
		if (afterPartyLocation.getTime() != null) {
			result
				.append(" - ")
				.append(DateTimeUtil.getDefaultFormattedTime(afterPartyLocation.getTime(), languageCode))
				.append(" Uhr");
		}
		result.append(FormatterUtil.NEWLINE);

		appendStringIfNotEmpty(result, afterPartyLocation.getAddressName());
		appendStringIfNotEmpty(result, afterPartyLocation.getStreet() + " " + afterPartyLocation.getStreetNr());
		appendStringIfNotEmpty(result, afterPartyLocation.getZip() + " " + afterPartyLocation.getCityName());
		appendStringIfNotEmpty(result, afterPartyLocation.getAddressRemarks());
		return result.toString();
	}

	private static void appendStringIfNotEmpty(StringBuilder sb, String value) {
		if (StringUtils.isNotEmpty(value)) {
			sb.append(value).append(FormatterUtil.NEWLINE);
		}
	}

	private static String getLocationInfo(RunningDinner runningDinner) {
		return runningDinner.getZip() + " " + runningDinner.getCity() +
					 FormatterUtil.NEWLINE +
					 DateTimeUtil.getDefaultFormattedDate(runningDinner.getDate(), runningDinner.getLanguageCode());
	}

	public static ProposalExample newMessageProposalExample(BaseMessage messageTemplate, RunningDinner runningDinner) {
    return switch (messageTemplate) {
      case DinnerRouteMessage dinnerRouteMessage -> newDinnerRouteMessageExampleProposal(dinnerRouteMessage, runningDinner);
      case TeamMessage teamMessage -> newTeamMessageExampleProposal(teamMessage, runningDinner);
      case ParticipantMessage participantMessage -> newParticipantMessageExampleProposal(participantMessage, runningDinner);
      case null, default -> null;
    };
  }

  private static ProposalExample newDinnerRouteMessageExampleProposal(DinnerRouteMessage dinnerRouteMessage, RunningDinner runningDinner) {
    String textContent = "## Subject" + FormatterUtil.NEWLINE + dinnerRouteMessage.getSubject() + FormatterUtil.TWO_NEWLINES +
						             "## Message Template" + dinnerRouteMessage.getMessage() + FormatterUtil.TWO_NEWLINES;
    textContent += "### Hosts Template" + FormatterUtil.NEWLINE + dinnerRouteMessage.getHostsTemplate() + FormatterUtil.TWO_NEWLINES;
    textContent += "### Self Template" + FormatterUtil.NEWLINE + dinnerRouteMessage.getSelfTemplate();
    return new ProposalExample(mapMessagePath(MessageType.DINNER_ROUTE, runningDinner), textContent);
  }

  private static ProposalExample newTeamMessageExampleProposal(TeamMessage teamMessage, RunningDinner runningDinner) {
    String textContent = "## Subject" +  FormatterUtil.NEWLINE  + teamMessage.getSubject() + FormatterUtil.TWO_NEWLINES +
											   "## Message Template" + FormatterUtil.NEWLINE + teamMessage.getMessage() + FormatterUtil.TWO_NEWLINES;
    textContent += "### Host Template" + FormatterUtil.NEWLINE + teamMessage.getHostMessagePartTemplate() + FormatterUtil.TWO_NEWLINES;
    textContent += "### Non Host Template" + FormatterUtil.NEWLINE + teamMessage.getNonHostMessagePartTemplate();
    return new ProposalExample(mapMessagePath(MessageType.TEAM, runningDinner), textContent);
  }

  private static ProposalExample newParticipantMessageExampleProposal(ParticipantMessage participantMessage, RunningDinner runningDinner) {
    String textContent = "## Subject" + FormatterUtil.NEWLINE + participantMessage.getSubject() + FormatterUtil.TWO_NEWLINES +
												 "## Message Template" + FormatterUtil.NEWLINE + participantMessage.getMessage();
    return new ProposalExample(mapMessagePath(MessageType.PARTICIPANT, runningDinner), textContent);
  }

  private static String mapEventDescriptionPath(RunningDinner runningDinner) {
    return EVENT_DESCRIPTIONS_INPUT_PREFIX + "/" + runningDinner.getAdminId() + ".md";
  }

	private static String mapMessagePath(MessageType messageType, RunningDinner runningDinner) {
    return MESSAGES_INPUT_PREFIX + "/" + messageType.toString() + "/" + runningDinner.getAdminId() + ".md";
  }
}
