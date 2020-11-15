package org.runningdinner.event.listener;

import java.util.List;

import org.runningdinner.admin.activity.ActivityService;
import org.runningdinner.admin.message.MessageService;
import org.runningdinner.event.TeamsHostChangedEvent;
import org.runningdinner.participant.Participant;
import org.runningdinner.participant.Team;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Assert;

@Component
public class TeamsHostChangedListener implements ApplicationListener<TeamsHostChangedEvent> {

  @Autowired
  private ActivityService activityService;
  
  @Autowired
  private MessageService messageService;

  @Transactional(propagation = Propagation.REQUIRES_NEW)
  @Override
  public void onApplicationEvent(TeamsHostChangedEvent event) {

    if (event.isChangedByParticipant()) {
      activityService.createActivityForTeamsHostChangedByParticipant(event.getTeams(), event.getRunningDinner(), event.getExecutingParticipant());
      
      List<Team> teams = event.getTeams();
      Assert.state(teams.size() == 1, "Expected exactly one team, but found " + teams);
      
      Participant executingParticipant = event.getExecutingParticipant();
      String comment = event.getComment();
      messageService.sendTeamHostChangedMessages(event.getRunningDinner().getAdminId(), teams.get(0), executingParticipant, comment);
    } else {
      activityService.createActivityForTeamsHostChangedByAdmin(event.getTeams(), event.getRunningDinner());
    }
  }

}
