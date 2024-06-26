package org.runningdinner.core.util;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class EnvUtilService {

  @Autowired
  private Environment environment;

  public boolean isProfileActive(String profileName) {
    String[] activeProfiles = environment != null ? environment.getActiveProfiles() : new String[] {};
    return Arrays.stream(activeProfiles).anyMatch(profileName::equalsIgnoreCase);
  }
  
  public String getConfigProperty(String key) {
    return environment.getProperty(key);
  }
}
