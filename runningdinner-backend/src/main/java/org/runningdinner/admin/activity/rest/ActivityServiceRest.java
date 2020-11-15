package org.runningdinner.admin.activity.rest;

import java.time.LocalDate;
import java.util.List;

import org.runningdinner.admin.RunningDinnerService;
import org.runningdinner.admin.activity.Activity;
import org.runningdinner.admin.activity.ActivityService;
import org.runningdinner.admin.activity.ActivityType;
import org.runningdinner.admin.activity.Checklist;
import org.runningdinner.core.RunningDinner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Slice;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/rest/activityservice/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class ActivityServiceRest {

  @Autowired
  private ActivityService activityService;

  @Autowired
  private RunningDinnerService runningDinnerService;

  @RequestMapping(value = "/runningdinner/{adminId}/admin", method = RequestMethod.GET)
  public DashboardAdminActivitiesTO getAdminActivities(@PathVariable("adminId") String adminId) {

    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);

    List<Activity> activities = activityService.findAdministrationActivityStream(runningDinner);
    Checklist checkList = activityService.generateChecklist(activities, LocalDate.now(), runningDinner);

    DashboardAdminActivitiesTO result = new DashboardAdminActivitiesTO(activities);
    result.setCheckList(checkList);
    return result;
  }

  @RequestMapping(value = "/runningdinner/{adminId}/participant", method = RequestMethod.GET)
  public ActivityListTO getParticipantActivities(@PathVariable("adminId") String adminId,
                                                 @RequestParam(name = "page", defaultValue = "0") int page) {

    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);
    Slice<Activity> result = activityService.findParticipantActionsActivityStream(runningDinner, page);
    return mapToList(result);
  }

  @RequestMapping(value = "/runningdinner/{adminId}", method = RequestMethod.GET)
  public ActivityListTO findActivitiesByType(@PathVariable("adminId") String adminId, 
                                             @RequestParam(name = "type") List<ActivityType> activityTypeParams) {
    
    ActivityType[] activityTypes = activityTypeParams.toArray(new ActivityType[] {});
    List<Activity> result = activityService.findActivitiesByTypes(adminId, activityTypes);
    return new ActivityListTO(result);
  }
  
  private static ActivityListTO mapToList(Slice<Activity> activityResultSlice) {

    if (activityResultSlice.hasContent()) {
      List<Activity> activities = activityResultSlice.getContent();
      boolean hasNext = activityResultSlice.hasNext();
      int number = activityResultSlice.getNumber();

      return new ActivityListTO(activities, number, hasNext);
    }
    return new ActivityListTO();
  }
}