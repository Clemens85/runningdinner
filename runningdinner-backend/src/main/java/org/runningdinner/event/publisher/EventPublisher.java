
package org.runningdinner.event.publisher;

import java.util.List;

import org.runningdinner.core.RunningDinner;
import org.runningdinner.event.MealTimesUpdatedEvent;
import org.runningdinner.event.MealsSwappedEvent;
import org.runningdinner.event.NewParticipantSubscribedEvent;
import org.runningdinner.event.NewRunningDinnerEvent;
import org.runningdinner.event.ParticipantNumbersSwappedEvent;
import org.runningdinner.event.RunningDinnerCancelledEvent;
import org.runningdinner.event.RunningDinnerSettingsUpdatedEvent;
import org.runningdinner.event.TeamArrangementsDroppedEvent;
import org.runningdinner.event.TeamCancelledEvent;
import org.runningdinner.event.TeamMembersSwappedEvent;
import org.runningdinner.event.TeamsArrangedEvent;
import org.runningdinner.event.TeamsHostChangedEvent;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.runningdinner.participant.TeamCancellationResult;
import org.springframework.context.ApplicationEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.ApplicationEventPublisherAware;
import org.springframework.stereotype.Component;

/**
 * Simple Spring component which is used for publishing ApplicationEvents in a synchronous way.
 * 
 * @author Clemens Stich
 * 
 */
@Component
public class EventPublisher implements ApplicationEventPublisherAware {

  private ApplicationEventPublisher applicationEventPublisher;

  /**
   * Publish the event about a new created running dinner
   * 
   * @param runningDinner
   */
  public void notifyNewRunningDinner(final RunningDinner runningDinner) {

    applicationEventPublisher.publishEvent(new NewRunningDinnerEvent(this, runningDinner));
  }

  public void notifyNewParticipant(Participant participant, RunningDinner runningDinner) {

    applicationEventPublisher.publishEvent(new NewParticipantSubscribedEvent(this, participant, runningDinner));
  }

  public void notifyTeamsArranged(List<Team> teams, RunningDinner runningDinner) {

    applicationEventPublisher.publishEvent(new TeamsArrangedEvent(this, teams, runningDinner));
  }

  public void notifyTeamArrangementsDropped(List<Team> teams, RunningDinner runningDinner, boolean teamsRecreated) {

    applicationEventPublisher.publishEvent(new TeamArrangementsDroppedEvent(this, teams, runningDinner, teamsRecreated));
  }
  
  public void notifyTeamMembersSwappedEvent(Participant firstParticipant, Participant secondParticipant,
      List<Team> affectedParentTeams, RunningDinner runningDinner) {

    applicationEventPublisher
        .publishEvent(new TeamMembersSwappedEvent(this, firstParticipant, secondParticipant, affectedParentTeams,
            runningDinner));
  }
  
  public void notifyParticipantNumbersSwappedEvent(Participant firstParticipant, Participant secondParticipant, RunningDinner runningDinner) {

    applicationEventPublisher.publishEvent(new ParticipantNumbersSwappedEvent(this, firstParticipant, secondParticipant, runningDinner));
  }

  public void notifyMealsSwappedEvent(MealsSwappedEvent mealsSwappedEvent) {
    applicationEventPublisher.publishEvent(mealsSwappedEvent);
  }

  public void notifyTeamsHostChangedByAdminEvent(List<Team> teams, RunningDinner runningDinner) {

    applicationEventPublisher.publishEvent(new TeamsHostChangedEvent(this, teams, runningDinner));
  }

  public void notifyTeamsHostChangedByParticipantEvent(List<Team> teams, RunningDinner runningDinner, Participant executingParticipant, String comment) {

    applicationEventPublisher.publishEvent(new TeamsHostChangedEvent(this, teams, runningDinner, executingParticipant, comment));
  }
  
  public void notifyMealTimesUpdated(RunningDinner runningDinner) {

    applicationEventPublisher.publishEvent(new MealTimesUpdatedEvent(this, runningDinner));
  }

  public void notifyTeamCancelledEvent(TeamCancellationResult teamCancellationResult, RunningDinner runningDinner) {

    applicationEventPublisher.publishEvent(new TeamCancelledEvent(this, teamCancellationResult, runningDinner));
  }
  
  public void notifyRunningDinnerCancelled(RunningDinner runningDinner) {

    applicationEventPublisher.publishEvent(new RunningDinnerCancelledEvent(this, runningDinner));
  }

  public void notifyRunningDinnerSettingsUpdated(RunningDinnerSettingsUpdatedEvent runningDinnerSettingsUpdatedEvent) {

    applicationEventPublisher.publishEvent(runningDinnerSettingsUpdatedEvent);
  }
  
  public void notifyEvent(ApplicationEvent event) {
  	
  	applicationEventPublisher.publishEvent(event);
  }
  
  @Override
  public void setApplicationEventPublisher(ApplicationEventPublisher applicationEventPublisher) {

    this.applicationEventPublisher = applicationEventPublisher;
  }


}
