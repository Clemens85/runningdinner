package org.runningdinner.participant.rest.dinnerroute;

import java.util.ArrayList;
import java.util.List;

public class DinnerRouteAddressEntityListTO {

  private List<DinnerRouteAddressEntityTO> addressEntities = new ArrayList<>();

  public List<DinnerRouteAddressEntityTO> getAddressEntities() {
    return addressEntities;
  }

  public void setAddressEntities(List<DinnerRouteAddressEntityTO> addressEntities) {
    this.addressEntities = addressEntities;
  }
}
