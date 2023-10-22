package org.runningdinner.admin.activity;

import java.util.Collection;
import java.util.List;

import org.runningdinner.core.RunningDinnerRelatedRepository;

public interface ActivityRepository extends RunningDinnerRelatedRepository<Activity> {

	List<Activity> findAllByAdminIdOrderByActivityDateAsc(String adminId);

	List<Activity> findAllByActivityTypeInAndAdminIdOrderByActivityDateAsc(Collection<ActivityType> activityTypes, String adminId);

  List<Activity> findAllByActivityTypeInAndAdminIdOrderByActivityDateDesc(Collection<ActivityType> activityTypes, String adminId);

}
