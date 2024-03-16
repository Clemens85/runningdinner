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
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(value = "/rest/activityservice/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class ActivityServiceRest {

  @Autowired
  private ActivityService activityService;

  @Autowired
  private RunningDinnerService runningDinnerService;

  @GetMapping("/runningdinner/{adminId}/admin")
  public DashboardAdminActivitiesTO getAdminActivities(@PathVariable String adminId) {

    RunningDinner runningDinner = runningDinnerService.findRunningDinnerByAdminId(adminId);

    List<Activity> activities = activityService.findAdministrationActivityStream(runningDinner);
    Checklist checkList = activityService.generateChecklist(activities, LocalDate.now(), runningDinner);

    DashboardAdminActivitiesTO result = new DashboardAdminActivitiesTO(activities);
    result.setCheckList(checkList);
    return result;
  }

  @GetMapping("/runningdinner/{adminId}")
  public ActivityListTO findActivitiesByType(@PathVariable String adminId, 
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