package org.runningdinner.event.listener;

import org.runningdinner.event.publisher.MealsAddedOrRemovedEvent;
import org.runningdinner.participant.TeamService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Drops team assignments and visitation plans when meals have been added or removed
 */
@Component
@Order(0)
public class MealsAddedOrRemovedTeamHandler implements ApplicationListener<MealsAddedOrRemovedEvent> {

	private static final Logger LOGGER = LoggerFactory.getLogger(MealsAddedOrRemovedTeamHandler.class);

	private final TeamService teamService;

	public MealsAddedOrRemovedTeamHandler(TeamService teamService) {
		this.teamService = teamService;
	}

	@Override
	public void onApplicationEvent(MealsAddedOrRemovedEvent mealsAddedOrRemovedEvent) {
		if (!mealsAddedOrRemovedEvent.isMealsAddedOrRemoved()) {
			return;
		}
		var existingTeams = teamService.findTeamArrangements(mealsAddedOrRemovedEvent.getRunningDinner().getAdminId(), false);
		if (existingTeams.isEmpty()) {
			return;
		}
		LOGGER.info("Dropping team assignments and visitation plans for running dinner with adminId={} due to addition and/or removal of meals",
								mealsAddedOrRemovedEvent.getRunningDinner().getAdminId());
		teamService.dropTeamAndAndVisitationPlans(mealsAddedOrRemovedEvent.getRunningDinner().getAdminId(), false, true);
	}
}
