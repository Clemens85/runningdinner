package org.runningdinner.dinnerroute;

import java.util.List;
import java.util.UUID;

import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.dinnerroute.distance.GeocodedAddressEntityListTO;
import org.runningdinner.dinnerroute.neighbours.TeamNeighbourCluster;
import org.runningdinner.dinnerroute.neighbours.TeamNeighbourClusterCalculationService;
import org.runningdinner.dinnerroute.neighbours.TeamNeighbourClusterListTO;
import org.runningdinner.dinnerroute.optimization.CalculateDinnerRouteOptimizationRequest;
import org.runningdinner.dinnerroute.optimization.DinnerRouteOptimizationResult;
import org.runningdinner.dinnerroute.optimization.DinnerRouteOptimizationService;
import org.runningdinner.dinnerroute.optimization.OptimizationImpact;
import org.runningdinner.dinnerroute.optimization.SaveDinnerRouteOptimizationRequest;
import org.springframework.http.MediaType;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping(value = "/rest/dinnerrouteservice/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class DinnerRouteServiceRest {

  private final DinnerRouteService dinnerRouteService;
  
  private final DinnerRouteOptimizationService dinnerRouteOptimizationService;

	private final TeamNeighbourClusterCalculationService teamNeighbourClusterCalculationService;

  public DinnerRouteServiceRest(DinnerRouteService dinnerRouteService, 
  															DinnerRouteOptimizationService dinnerRouteOptimizationService,
  															TeamNeighbourClusterCalculationService teamNeighbourClusterCalculationService) {
    this.dinnerRouteService = dinnerRouteService;
		this.dinnerRouteOptimizationService = dinnerRouteOptimizationService;
		this.teamNeighbourClusterCalculationService = teamNeighbourClusterCalculationService;
  }

  @GetMapping("/runningdinner/{adminId}/teams/{teamId}")
  public DinnerRouteTO findDinnerRoute(@PathVariable String adminId, @PathVariable UUID teamId) {

    return dinnerRouteService.findDinnerRoute(adminId, teamId).withMealSpecificsInHtmlFormat();
  }

  @GetMapping("/runningdinner/{adminId}/teams")
  public DinnerRouteListTO findAllDinnerRoutes(@PathVariable String adminId) {
    return dinnerRouteService.findAllDinnerRoutes(adminId);
  }

  @PutMapping("/runningdinner/{adminId}/distances/{range}/teams")
  public TeamNeighbourClusterListTO calculateTeamNeighbourClusters(@PathVariable("adminId") String adminId,
  																																 @PathVariable("range") Integer rangeInMeters,
  																																 @RequestBody @Valid GeocodedAddressEntityListTO addressEntityList) {

    Assert.state(rangeInMeters >= 0, "range must be > 0");
    List<TeamNeighbourCluster> result = teamNeighbourClusterCalculationService.calculateTeamNeighbourClusters(adminId, addressEntityList.getAddressEntities(), rangeInMeters);
    return new TeamNeighbourClusterListTO(result);
  }

  @PutMapping("/runningdinner/{adminId}/distances/teams")
  public AllDinnerRoutesWithDistancesListTO calculateRouteDistances(@PathVariable("adminId") String adminId,
                                                                	  @RequestBody @Valid GeocodedAddressEntityListTO addressEntityList) {

    return dinnerRouteService.calculateDinnerRouteDistances(adminId, addressEntityList);
  }

  @PutMapping("/runningdinner/{adminId}/distances/optimization")
  public DinnerRouteOptimizationResult calculateOptimization(@PathVariable("adminId") String adminId,
  												  			 @RequestBody @Valid CalculateDinnerRouteOptimizationRequest calculateRequest) throws NoPossibleRunningDinnerException {
    return dinnerRouteOptimizationService.calculateOptimization(adminId, calculateRequest);
  }
  
  @PutMapping("/runningdinner/{adminId}/teams")
  public void saveNewDinnerRoutes(@PathVariable("adminId") String adminId,
  																@RequestBody @Valid SaveDinnerRouteOptimizationRequest saveRequest) throws NoPossibleRunningDinnerException {
		dinnerRouteOptimizationService.saveNewDinnerRoutes(adminId, saveRequest);
  }
  
  @PutMapping("/runningdinner/{adminId}/distances/optimization/predict")
  public OptimizationImpact predictOptimizationImpact(@PathVariable("adminId") String adminId,
  																										@RequestBody @Valid GeocodedAddressEntityListTO addressEntityList) throws NoPossibleRunningDinnerException {
		return dinnerRouteOptimizationService.predictOptimizationImpact(adminId, addressEntityList);
  }
}
