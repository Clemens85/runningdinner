package org.runningdinner.admin.message.proposal;

import org.runningdinner.admin.message.BaseMessage;
import org.runningdinner.admin.message.dinnerroute.DinnerRouteMessage;
import org.runningdinner.admin.message.job.MessageType;
import org.runningdinner.admin.message.participant.ParticipantMessage;
import org.runningdinner.admin.message.team.TeamMessage;
import org.runningdinner.core.AfterPartyLocation;
import org.runningdinner.core.PublicSettings;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.mail.formatter.FormatterUtil;

public final class ProposalBaseGenerator {

  public static final String EVENT_DESCRIPTIONS_INPUT_PREFIX = "input/event_descriptions";
  public static final String MESSAGES_INPUT_PREFIX = "input/messages";

  private ProposalBaseGenerator() {
    // Utility class
  }

  public static ProposalBase newEventDescriptionProposal(RunningDinner runningDinner) {
    final PublicSettings publicSettings = runningDinner.getPublicSettings();
    StringBuilder textContent = new StringBuilder("## " + publicSettings.getPublicTitle())
        .append(FormatterUtil.NEWLINE)
        .append(publicSettings.getPublicDescription());

    if (runningDinner.getAfterPartyLocation().isPresent()) {
      textContent.append(FormatterUtil.NEWLINE);
      final AfterPartyLocation afterPartyLocation = runningDinner.getAfterPartyLocation().get();
      textContent
          .append(afterPartyLocation.getTitle());
    }

    return new ProposalBase(
        mapEventDescriptionPath(runningDinner),
        textContent.toString()
    );
  }

  public static ProposalBase newMessageProposal(BaseMessage messageTemplate, RunningDinner runningDinner) {
    return switch (messageTemplate) {
      case DinnerRouteMessage dinnerRouteMessage -> newDinnerRouteMessageProposal(dinnerRouteMessage, runningDinner);
      case TeamMessage teamMessage -> newTeamMessageProposal(teamMessage, runningDinner);
      case ParticipantMessage participantMessage -> newParticipantMessageProposal(participantMessage, runningDinner);
      case null, default -> null;
    };
  }

  private static ProposalBase newDinnerRouteMessageProposal(DinnerRouteMessage dinnerRouteMessage, RunningDinner runningDinner) {
    String textContent = "## Subject" + FormatterUtil.NEWLINE + "## Message" + dinnerRouteMessage.getMessage() + FormatterUtil.NEWLINE;
    textContent += "## Hosts Template" + FormatterUtil.NEWLINE + dinnerRouteMessage.getHostsTemplate() + FormatterUtil.NEWLINE;
    textContent += "## Self Template" + FormatterUtil.NEWLINE + dinnerRouteMessage.getSelfTemplate();
    return new ProposalBase(mapMessagePath(MessageType.DINNER_ROUTE, runningDinner), textContent);
  }

  private static ProposalBase newTeamMessageProposal(TeamMessage teamMessage, RunningDinner runningDinner) {
    String textContent = "## Subject" + FormatterUtil.NEWLINE + "## Message" + teamMessage.getMessage() + FormatterUtil.NEWLINE;
    textContent += "## Host Template" + FormatterUtil.NEWLINE + teamMessage.getHostMessagePartTemplate() + FormatterUtil.NEWLINE;
    textContent += "## Non Host Template" + FormatterUtil.NEWLINE + teamMessage.getNonHostMessagePartTemplate();
    return new ProposalBase(mapMessagePath(MessageType.TEAM, runningDinner), textContent);
  }

  private static ProposalBase newParticipantMessageProposal(ParticipantMessage participantMessage, RunningDinner runningDinner) {
    String textContent = "## Subject" + FormatterUtil.NEWLINE + "## Message" + FormatterUtil.NEWLINE + participantMessage.getMessage();
    return new ProposalBase(mapMessagePath(MessageType.PARTICIPANT, runningDinner), textContent);
  }

  private static String mapEventDescriptionPath(RunningDinner runningDinner) {
    return EVENT_DESCRIPTIONS_INPUT_PREFIX + "/" + runningDinner.getAdminId() + ".md";
  }
  private static String mapMessagePath(MessageType messageType, RunningDinner runningDinner) {
    return MESSAGES_INPUT_PREFIX + "/" + messageType.toString() + "/" + runningDinner.getAdminId() + ".md";
  }
}
