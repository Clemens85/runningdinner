package org.runningdinner.admin.activity;

import java.util.Collection;
import java.util.List;

import org.runningdinner.core.RunningDinnerRelatedRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;

public interface ActivityRepository extends RunningDinnerRelatedRepository<Activity> {

	List<Activity> findAllByAdminIdOrderByActivityDateAsc(String adminId);

	List<Activity> findAllByActivityTypeInAndAdminIdOrderByActivityDateAsc(Collection<ActivityType> activityTypes, String adminId);

  List<Activity> findAllByActivityTypeInAndAdminIdOrderByActivityDateDesc(Collection<ActivityType> activityTypes, String adminId);

  Slice<Activity> findSliceByActivityTypeInAndAdminId(Collection<ActivityType> activityTypes, String adminId, Pageable pageable);
}
