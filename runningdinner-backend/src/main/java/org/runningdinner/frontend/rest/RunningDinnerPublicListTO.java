
package org.runningdinner.frontend.rest;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.runningdinner.core.RunningDinner;

public class RunningDinnerPublicListTO {

  private List<RunningDinnerPublicTO> publicRunningDinners = new ArrayList<>();

  public RunningDinnerPublicListTO() {

  }

  public RunningDinnerPublicListTO(List<RunningDinner> publicRunningDinnerList, LocalDate now) {
    
    this.publicRunningDinners = publicRunningDinnerList
                                  .stream()
                                  .map(r -> new RunningDinnerPublicTO(r, now))
                                  .collect(Collectors.toList());
  }

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
