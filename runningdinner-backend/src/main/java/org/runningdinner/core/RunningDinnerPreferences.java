
package org.runningdinner.core;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.runningdinner.admin.RunningDinnerPreferencesRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.google.common.base.Optional;

@Component
@Scope("prototype")
public class RunningDinnerPreferences {

  public static final String USE_CUSTOM_MAILSERVER = "customMailServer";

  protected Set<RunningDinnerPreference> preferences;

  @Autowired
  protected RunningDinnerPreferencesRepository repository;

  protected RunningDinner runningDinner;

  public RunningDinnerPreferences(List<RunningDinnerPreference> preferences) {
    super();
    if (preferences == null) {
      this.preferences = Collections.emptySet();
    } else {
      this.preferences = new HashSet<RunningDinnerPreference>(preferences);
    }

  }

  public RunningDinnerPreferences() {
  }

  public RunningDinnerPreference getPreference(String name) {

    for (RunningDinnerPreference preference : preferences) {
      if (StringUtils.equals(preference.getPreferenceName(), name)) {
        return preference;
      }
    }
    return null;
  }

  public String getValue(String name) {

    RunningDinnerPreference preference = getPreference(name);
    if (preference != null) {
      return preference.getPreferenceValue();
    }
    return null;
  }

  public Optional<Boolean> getBooleanValue(String name) {

    RunningDinnerPreference preference = getPreference(name);
    if (preference != null) {
      String value = preference.getPreferenceValue();
      if (StringUtils.isNotEmpty(value)) {
        return Optional.of(Boolean.parseBoolean(value));
      }
    }
    return Optional.absent();
  }

  /**
   * Adds a new preference to the running dinner preferences. If the specified preference already exist it will automatically be
   * overwritten.<br>
   * The added preference is persisted after method call finishes.
   * 
   * @param name
   * @param value
   * @return The persisted preference
   */
  @Transactional
  public RunningDinnerPreference addPreference(String name, String value) {

    RunningDinnerPreference preference = repository.findByPreferenceNameAndAdminId(name, runningDinner.getAdminId());
    if (preference == null) {
      preference = new RunningDinnerPreference(runningDinner);
      preference.setPreferenceName(name);
    }
    preference.setPreferenceValue(value);
    RunningDinnerPreference savedPreference = repository.save(preference);

    if (!preferences.add(savedPreference)) {
      // Preference existed already, thus remove it and add the updated preference instead
      preferences.remove(preference);
      preferences.add(savedPreference);
    }

    return savedPreference;
  }

  public Collection<RunningDinnerPreference> getAllPreferences() {

    return Collections.unmodifiableCollection(preferences);
  }

  public void init(RunningDinner runningDinner, List<RunningDinnerPreference> preferences) {

    this.preferences = new HashSet<RunningDinnerPreference>(preferences);
    this.runningDinner = runningDinner;
  }

  @Override
  public String toString() {

    return preferences.toString();
  }

}
