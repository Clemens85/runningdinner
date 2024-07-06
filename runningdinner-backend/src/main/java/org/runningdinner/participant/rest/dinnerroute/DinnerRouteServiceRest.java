package org.runningdinner.participant.rest.dinnerroute;

import org.runningdinner.geocoder.distance.DistanceCalculator;
import org.runningdinner.geocoder.distance.DistanceMatrix;
import org.runningdinner.participant.DinnerRouteService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(value = "/rest/dinnerrouteservice/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class DinnerRouteServiceRest {

  private final DinnerRouteService dinnerRouteService;

  public DinnerRouteServiceRest(DinnerRouteService dinnerRouteService) {
    this.dinnerRouteService = dinnerRouteService;
  }

  @GetMapping("/runningdinner/{adminId}/teams/{teamId}")
  public DinnerRouteTO findDinnerRoute(@PathVariable String adminId, @PathVariable UUID teamId) {

    return dinnerRouteService.findDinnerRoute(adminId, teamId).withMealSpecificsInHtmlFormat();
  }

  @GetMapping("/runningdinner/{adminId}/teams")
  public DinnerRouteListTO findAllDinnerRoutes(@PathVariable String adminId) {

    var result = dinnerRouteService.findAllDinnerRoutes(adminId);
    return new DinnerRouteListTO(result);
  }

  @PutMapping("/runningdinner/{adminId}/distances")
  public DistanceMatrix findDistanceMatrix(@RequestBody DinnerRouteAddressEntityListTO addressEntityList) {

    DistanceMatrix distanceMatrix = DistanceCalculator.calculateDistanceMatrix(addressEntityList.getAddressEntities());
    return distanceMatrix;
  }
}
