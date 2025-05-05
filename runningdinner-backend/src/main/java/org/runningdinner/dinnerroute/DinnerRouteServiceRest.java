package org.runningdinner.dinnerroute;

import java.util.List;
import java.util.UUID;

import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.dinnerroute.distance.GeocodedAddressEntityListTO;
import org.runningdinner.dinnerroute.optimization.DinnerRouteOptimizationResult;
import org.runningdinner.dinnerroute.optimization.DinnerRouteOptimizationService;
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

  public DinnerRouteServiceRest(DinnerRouteService dinnerRouteService, 
  															DinnerRouteOptimizationService dinnerRouteOptimizationService) {
    this.dinnerRouteService = dinnerRouteService;
		this.dinnerRouteOptimizationService = dinnerRouteOptimizationService;
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
  public TeamNeighbourClusterListTO calculateTeamDistanceClusters(@PathVariable("adminId") String adminId,
                                                                 @PathVariable("range") Integer rangeInMeters,
                                                                 @RequestBody @Valid GeocodedAddressEntityListTO addressEntityList) {

    Assert.state(rangeInMeters >= 0, "range must be > 0");
    List<TeamNeighbourCluster> result = dinnerRouteService.calculateTeamNeighbourClusters(adminId, addressEntityList.getAddressEntities(), rangeInMeters);
    return new TeamNeighbourClusterListTO(result);
  }

  @PutMapping("/runningdinner/{adminId}/distances/teams")
  public AllDinnerRoutesWithDistancesListTO calculateRouteDistances(@PathVariable("adminId") String adminId,
                                                                	  @RequestBody @Valid GeocodedAddressEntityListTO addressEntityList) {

    return dinnerRouteService.calculateDinnerRouteDistances(adminId, addressEntityList);
  }

  @PutMapping("/runningdinner/{adminId}/distances/optimization")
  public DinnerRouteOptimizationResult calculateOptimization(@PathVariable("adminId") String adminId,
  												  			  												 @RequestBody @Valid GeocodedAddressEntityListTO addressEntityList) {
  	try {
			return dinnerRouteOptimizationService.calculateOptimization(adminId, addressEntityList);
		} catch (NoPossibleRunningDinnerException e) {
			throw new IllegalStateException(e);
		}
  }
  
  @PutMapping("/runningdinner/{adminId}/teams")
  public void saveNewDinnerRoutes(@PathVariable("adminId") String adminId,
  																@RequestBody @Valid SaveDinnerRouteOptimizationRequest saveRequest) {
  	
  	try {
			dinnerRouteOptimizationService.saveNewDinnerRoutes(adminId, saveRequest);
		} catch (NoPossibleRunningDinnerException e) {
			throw new IllegalStateException(e);
		}
  }
  
  @GetMapping("/runningdinner/{adminId}/distances/optimization/check")
  public void checkOptimizationPossible(@PathVariable("adminId") String adminId) {
  	
  	// TODO: Check if it may be possible
  }
}
