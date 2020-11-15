package org.runningdinner.mail.formatter;

import java.util.Locale;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.common.service.LocalizationProviderService;
import org.runningdinner.common.service.UrlGenerator;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.stereotype.Component;

@Component
public class TeamHostChangedFormatter {

	@Autowired
	UrlGenerator urlGenerator;

	@Autowired
	MessageSource messageSource;

	@Autowired
	LocalizationProviderService localizationProviderService;

	public String formatTeamHostChangeMessage(final RunningDinner runningDinner, final Team team, final Participant participant, final String comment,
			final Participant teamHostEditor) {

		Locale locale = localizationProviderService.getLocaleOfDinner(runningDinner);

		String messageTemplate = messageSource.getMessage("message.template.team.host.changed", null, locale);
		String message = messageTemplate.replaceAll(FormatterUtil.PARTNER, teamHostEditor.getName().getFullnameFirstnameFirst());

		if (StringUtils.isNotEmpty(comment)) {
			String commentTemplate = messageSource.getMessage("message.template.team.host.changed.comment", null, locale);
			commentTemplate = commentTemplate.replaceAll(FormatterUtil.PARTNER_MESSAGE, comment);
			commentTemplate = commentTemplate.replaceAll(FormatterUtil.FIRSTNAME, teamHostEditor.getName().getFirstnamePart());
			message = message.replaceAll(FormatterUtil.PARTNER_MESSAGE, commentTemplate);
		}
		else {
			message = message.replaceAll(FormatterUtil.PARTNER_MESSAGE, StringUtils.EMPTY);
		}

		message = message.replaceAll(FormatterUtil.FIRSTNAME, participant.getName().getFirstnamePart());
		String partnerEmail = StringUtils.isEmpty(teamHostEditor.getEmail()) ? messageSource.getMessage("message.template.no.email", null,
				locale) : teamHostEditor.getEmail();
		message = message.replaceAll(FormatterUtil.EMAIL, partnerEmail);

		String arrangementMessage = getArrangementMessage(team, participant, locale);

		String manageHostLink = urlGenerator.constructManageTeamHostUrl(runningDinner.getSelfAdministrationId(), team.getId(), participant.getId());
		message = message.replaceAll(FormatterUtil.MANGE_HOST_LINK, manageHostLink);
		message = message.replaceAll(FormatterUtil.ARRANGEMENT, arrangementMessage);

		return message;
	}

	private String getArrangementMessage(final Team team, final Participant participant, Locale locale) {

		String result = null;
		final Participant hostTeamMember = team.getHostTeamMember();

		if (hostTeamMember.equals(participant)) {
			result = messageSource.getMessage("message.template.team.host.changed.arrangement.you", null, locale);
		}
		else {
			result = messageSource.getMessage("message.template.team.host.changed.arrangement.other", null, locale);
			result = result.replaceAll(FormatterUtil.FIRSTNAME, hostTeamMember.getName().getFirstnamePart());
			result = result.replaceAll(FormatterUtil.LASTNAME, hostTeamMember.getName().getLastname());
		}

		return result;
	}
}
