package org.runningdinner.admin;

import java.util.List;

import org.runningdinner.core.RunningDinnerPreference;
import org.runningdinner.core.RunningDinnerRelatedRepository;

public interface RunningDinnerPreferencesRepository extends RunningDinnerRelatedRepository<RunningDinnerPreference> {

  List<RunningDinnerPreference> findByAdminIdOrderByPreferenceNameAsc(String adminId);
  
  RunningDinnerPreference findByPreferenceNameAndAdminId(String preferenceNAme, String adminId);

}
