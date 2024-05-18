package org.runningdinner.participant.rest.dinnerroute;

import java.util.ArrayList;
import java.util.List;

public class DinnerRouteListTO {

  private List<DinnerRouteTO> dinnerRoutes = new ArrayList<>();

  public DinnerRouteListTO(List<DinnerRouteTO> dinnerRoutes) {
    this.dinnerRoutes = dinnerRoutes;
  }

  public List<DinnerRouteTO> getDinnerRoutes() {
    return dinnerRoutes;
  }

}
