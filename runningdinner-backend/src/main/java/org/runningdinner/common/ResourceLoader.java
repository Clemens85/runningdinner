
package org.runningdinner.common;

import java.io.IOException;

import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

public final class ResourceLoader {

  private ResourceLoader() {
    
  }

  public static Resource getResource(final String location) {

    return new PathMatchingResourcePatternResolver().getResource(location);
  }

  public static Resource[] getResources(final String locationPattern)
    throws IOException {

    return new PathMatchingResourcePatternResolver().getResources(locationPattern);
  }

}
