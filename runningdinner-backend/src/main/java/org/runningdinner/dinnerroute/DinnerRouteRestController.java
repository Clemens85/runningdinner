package org.runningdinner.dinnerroute;

import jakarta.validation.Valid;
import org.runningdinner.core.NoPossibleRunningDinnerException;
import org.runningdinner.dinnerroute.neighbours.TeamNeighbourCluster;
import org.runningdinner.dinnerroute.neighbours.TeamNeighbourClusterCalculationService;
import org.runningdinner.dinnerroute.neighbours.TeamNeighbourClusterListTO;
import org.runningdinner.dinnerroute.optimization.CalculateDinnerRouteOptimizationRequest;
import org.runningdinner.dinnerroute.optimization.DinnerRouteOptimizationResult;
import org.runningdinner.dinnerroute.optimization.DinnerRouteOptimizationService;
import org.runningdinner.dinnerroute.optimization.OptimizationImpact;
import org.runningdinner.dinnerroute.optimization.TooManyOptimizationRequestsException;
import org.springframework.http.MediaType;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/rest/dinnerrouteservice/v1", produces = MediaType.APPLICATION_JSON_VALUE)
public class DinnerRouteRestController {

  private final DinnerRouteService dinnerRouteService;
  
  private final DinnerRouteOptimizationService dinnerRouteOptimizationService;

	private final TeamNeighbourClusterCalculationService teamNeighbourClusterCalculationService;

  public DinnerRouteRestController(DinnerRouteService dinnerRouteService,
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

  @GetMapping("/runningdinner/{adminId}/distances/{range}/teams")
  public TeamNeighbourClusterListTO calculateTeamNeighbourClusters(@PathVariable("adminId") String adminId,
  																																 @PathVariable("range") Integer rangeInMeters) {

    Assert.state(rangeInMeters >= 0, "range must be > 0");
    List<TeamNeighbourCluster> result = teamNeighbourClusterCalculationService.calculateTeamNeighbourClusters(adminId, rangeInMeters);
    return new TeamNeighbourClusterListTO(result);
  }

  @GetMapping("/runningdinner/{adminId}/distances/teams")
  public AllDinnerRoutesWithDistancesListTO calculateRouteDistances(@PathVariable("adminId") String adminId) {

    return dinnerRouteService.calculateDinnerRouteDistances(adminId);
  }

  @PostMapping("/runningdinner/{adminId}/distances/optimization")
  public String createNewOptimizationInstance(@PathVariable("adminId") String adminId,
												  			 					    @RequestBody @Valid CalculateDinnerRouteOptimizationRequest calculateRequest) throws TooManyOptimizationRequestsException {

		var publishedEvent = dinnerRouteOptimizationService.publishOptimizationEvent(adminId, calculateRequest);
		return """
						{ "optimizationId": "%s" }
						""".formatted(publishedEvent.getOptimizationId());
  }

	@GetMapping("/runningdinner/{adminId}/distances/optimization/{optimizationId}")
	public DinnerRouteOptimizationResult previewOptimizedDinnerRoutes(@PathVariable("adminId") String adminId, @PathVariable("optimizationId")  String optimizationId) throws NoPossibleRunningDinnerException {
		return dinnerRouteOptimizationService.previewOptimizedDinnerRoutes(adminId, optimizationId);
	}

	@PutMapping("/runningdinner/{adminId}/distances/optimization/{optimizationId}")
	public DinnerRouteListTO applyOptimizedDinnerRoutes(@PathVariable("adminId") String adminId, @PathVariable("optimizationId")  String optimizationId) throws NoPossibleRunningDinnerException {
		return dinnerRouteOptimizationService.applyOptimizedDinnerRoutes(adminId, optimizationId);
	}
  
  @GetMapping("/runningdinner/{adminId}/distances/optimization/predict")
  public OptimizationImpact predictOptimizationImpact(@PathVariable("adminId") String adminId) throws NoPossibleRunningDinnerException {
		return dinnerRouteOptimizationService.predictOptimizationImpact(adminId);
  }
}
