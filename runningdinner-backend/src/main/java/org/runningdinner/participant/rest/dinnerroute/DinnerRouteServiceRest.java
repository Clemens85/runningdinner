package org.runningdinner.participant.rest.dinnerroute;

import jakarta.validation.Valid;
import org.runningdinner.participant.DinnerRouteService;
import org.springframework.http.MediaType;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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

  @PutMapping("/runningdinner/{adminId}/distances/{range}/teams")
  public TeamDistanceClusterListTO calculateTeamDistanceClusters(@PathVariable("adminId") String adminId,
                                                                 @PathVariable("range") Integer rangeInMeters,
                                                                 @RequestBody @Valid GeocodedAddressEntityListTO addressEntityList) {

    Assert.state(rangeInMeters >= 0, "range must be > 0");
    List<TeamDistanceClusterTO> result = dinnerRouteService.calculateTeamDistanceClusters(adminId, addressEntityList.getAddressEntities(), rangeInMeters);
    return new TeamDistanceClusterListTO(result);
  }

}
