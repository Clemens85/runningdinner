
package org.runningdinner.frontend.rest;

import java.util.ArrayList;
import java.util.List;

public class RunningDinnerPublicListTO {

  private List<RunningDinnerPublicTO> publicRunningDinners = new ArrayList<>();

  public List<RunningDinnerPublicTO> getPublicRunningDinners() {

    return publicRunningDinners;
  }

  public void setPublicRunningDinners(List<RunningDinnerPublicTO> publicRunningDinners) {

    this.publicRunningDinners = publicRunningDinners;
  }

  @Override
  public String toString() {

    return "publicRunningDinners=" + publicRunningDinners;
  }

}
