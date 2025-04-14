package org.runningdinner.dinnerroute;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.runningdinner.common.exception.TechnicalException;
import org.runningdinner.core.RunningDinner;
import org.runningdinner.core.dinnerplan.TeamRouteBuilder;
import org.runningdinner.core.util.CoreUtil;
import org.runningdinner.core.util.LogSanitizer;
import org.runningdinner.dinnerroute.distance.DistanceEntry;
import org.runningdinner.dinnerroute.distance.DistanceMatrix;
import org.runningdinner.dinnerroute.distance.DistanceUtil;
import org.runningdinner.mail.formatter.DinnerRouteMessageFormatter;
import org.runningdinner.participant.Team;
import org.springframework.util.Assert;

public class DinnerRouteCalculator {

	private static final int MAX_ITERATIONS_OF_REVERSE_CLUSTERING = 200;
	
	private final RunningDinner runningDinner;
	private final DinnerRouteMessageFormatter dinnerRouteMessageFormatter;

	public DinnerRouteCalculator(RunningDinner runningDinner, DinnerRouteMessageFormatter dinnerRouteMessageFormatter) {
		this.runningDinner = runningDinner;
		this.dinnerRouteMessageFormatter = dinnerRouteMessageFormatter;
	}
	
	public DinnerRouteTO buildDinnerRoute(Team team) {

		Assert.state(!team.isNew(), "Expected team " + team.getTeamNumber() + " to have a valid ID");
		
		List<Team> dinnerRoute = TeamRouteBuilder.generateDinnerRoute(team);

		Team currentDinnerRouteTeam = team;
		
    String mealSpecificsOfGuestTeams = dinnerRouteMessageFormatter.getMealSpecificsOfGuestTeams(currentDinnerRouteTeam, runningDinner);
    
    return DinnerRouteTO.newInstance(team.getId(), dinnerRoute, mealSpecificsOfGuestTeams, runningDinner.getAfterPartyLocation());
	}
	
  public static Team findTeamForTeamNumber(String teamNumberStr, List<Team> teams) {
    int teamNumber = parseIntSafe(teamNumberStr);
    return teams
            .stream()
            .filter(t -> t.getTeamNumber() == teamNumber)
            .findFirst()
            .orElseThrow(() -> new IllegalStateException("Could not find team with teamMember " + teamNumber + " within teams " + teams));
  }
  

  public static int parseIntSafe(String src) {
    try {
      return Integer.parseInt(src);
    } catch (NumberFormatException e) {
      throw new TechnicalException("could not parse " + LogSanitizer.sanitize(src) + " as integer", e);
    }
  }
	
	public static AllDinnerRoutesWithDistancesListTO calculateDistancesForAllDinnerRoutes(List<DinnerRouteTO> allDinnerRoutes, DistanceMatrix distanceMatrix) {
		
    List<DinnerRouteWithDistancesTO> distancesForAllRoutes = new ArrayList<>();
    
    for (DinnerRouteTO dinnerRoute: allDinnerRoutes) {
      List<DinnerRouteTeamWithDistanceTO> distancesForSingleRoute = calculateDistancesBetweenTeamsOnSingleRoute(dinnerRoute, distanceMatrix);
      double averageDistanceInMeters = DistanceUtil.calculateAverageDistance(distancesForSingleRoute);
      distancesForAllRoutes.add(new DinnerRouteWithDistancesTO(distancesForSingleRoute, averageDistanceInMeters));
    }
    
    distancesForAllRoutes.sort(DinnerRouteTeamWithDistanceComparator.INSTANCE);

    double overallAverageDistance = DistanceUtil.calculateOverallAverageDistance(distancesForAllRoutes);
    double overallSumDistance = DistanceUtil.calculateOverallSumDistance(distancesForAllRoutes);
    AllDinnerRoutesWithDistancesListTO resultList = new AllDinnerRoutesWithDistancesListTO(distancesForAllRoutes, overallAverageDistance, overallSumDistance);
    DistanceUtil.convertMetersToKilometers(resultList);
    return resultList;
	}
	
	public static Map<Integer, LinkedHashSet<Integer>> reverseCalculateClustersOfTeams(List<DinnerRouteTO> dinnerRoutes) {
		
		Map<Integer, LinkedHashSet<Integer>> clusterMapping = new HashMap<>();
		
		int currentCluster = 1;
		
		for (int i = 0; i < dinnerRoutes.size(); i++) {
			
			DinnerRouteTO dinnerRoute = dinnerRoutes.get(i);
			if (isAlreadyContainedInCluster(dinnerRoute, clusterMapping)) {
				continue;
			}
			
			Deque<Integer> teamNumbersToVisit = new ArrayDeque<>(getTeamNumbersOfRoute(dinnerRoute));
			
			Integer currentTeamNumber = teamNumbersToVisit.poll();;
			int iterationCounter = 0;
			
			while (currentTeamNumber != null && iterationCounter <= MAX_ITERATIONS_OF_REVERSE_CLUSTERING) {
				LinkedHashSet<Integer> teamsOfCluster = clusterMapping.computeIfAbsent(currentCluster, key -> new LinkedHashSet<>());
				teamsOfCluster.add(currentTeamNumber);
				
				for (int j = i +1; j < dinnerRoutes.size(); j++) {
  				DinnerRouteTO nextDinnerRoute = dinnerRoutes.get(j);
  				Set<Integer> teamNumbersOfNextRoute = getTeamNumbersOfRoute(nextDinnerRoute);
  				if (teamNumbersOfNextRoute.contains(currentTeamNumber)) {
  					addToTeamNumbersToVisit(teamNumbersToVisit, CoreUtil.excludeFromSet(currentTeamNumber, teamNumbersOfNextRoute), clusterMapping);
  				}
				}
				
				iterationCounter++;
				
				currentTeamNumber = teamNumbersToVisit.poll();
			}
			
			Assert.state(iterationCounter <= MAX_ITERATIONS_OF_REVERSE_CLUSTERING, 
									 "Exceeded max iterations when building cluster " + currentCluster + " for route with index " + i + ": " + dinnerRoute);
			
			currentCluster++;
		}
		
		return clusterMapping;
	}
	
	private static boolean isAlreadyContainedInCluster(DinnerRouteTO dinnerRoute, Map<Integer, LinkedHashSet<Integer>> clusterMapping) {
		Set<Integer> allClusteredTeamNumbers = getTeamNumbersContainedInClusters(clusterMapping);
		Set<Integer> teamNumbersOfRoute = getTeamNumbersOfRoute(dinnerRoute);
		return allClusteredTeamNumbers.containsAll(teamNumbersOfRoute);
	}
	
	private static Set<Integer> getTeamNumbersContainedInClusters(Map<Integer, LinkedHashSet<Integer>> clusterMapping) {
		return clusterMapping.values()
      				.stream()
      				.flatMap(Set::stream)
      				.collect(Collectors.toSet());
	}

	private static void addToTeamNumbersToVisit(Deque<Integer> teamNumbersToVisit, Set<Integer> nextTeamNumbersToVisit, Map<Integer, LinkedHashSet<Integer>> clusterMapping) {
		Set<Integer> allClusteredTeamNumbers = getTeamNumbersContainedInClusters(clusterMapping);
		for (Integer nextTeamNumberToVisit : nextTeamNumbersToVisit) {
			if (!teamNumbersToVisit.contains(nextTeamNumberToVisit) && !allClusteredTeamNumbers.contains(nextTeamNumberToVisit)) {
				teamNumbersToVisit.add(nextTeamNumberToVisit);
			}
		}
	}
	
	private static Set<Integer> getTeamNumbersOfRoute(DinnerRouteTO dinnerRoute) {
		return dinnerRoute.getTeams()
                				.stream()
                				.map(t -> t.getTeamNumber())
                				.collect(Collectors.toSet());
	}
	
	private static List<DinnerRouteTeamWithDistanceTO> calculateDistancesBetweenTeamsOnSingleRoute(DinnerRouteTO dinnerRoute, DistanceMatrix distanceMatrix) {

    List<DinnerRouteTeamTO> dinnerRouteTeams = dinnerRoute.getTeams();
    List<DinnerRouteTeamWithDistanceTO> result = new ArrayList<>(dinnerRouteTeams.size());

    Map<DistanceEntry, Double> distanceMatrixEntries = distanceMatrix.getEntries();

    DinnerRouteTeamWithDistanceTO teamWithLargestDistance = null;

    for (int i = 0; i < dinnerRouteTeams.size(); i++) {
      DinnerRouteTeamTO a = dinnerRouteTeams.get(i);
      boolean isCurrentTeam = a.getTeamNumber() == dinnerRoute.getCurrentTeam().getTeamNumber();
      if (i + 1 >= dinnerRouteTeams.size()) {
        result.add(new DinnerRouteTeamWithDistanceTO(a, null, isCurrentTeam));
        break;
      }
      DinnerRouteTeamTO b = dinnerRouteTeams.get(i + 1);
      DistanceEntry distanceEntry = new DistanceEntry(String.valueOf(a.getTeamNumber()), String.valueOf(b.getTeamNumber()));
      Double distance = distanceMatrixEntries.get(distanceEntry);
      DinnerRouteTeamWithDistanceTO dinnerRouteTeamWithDistanceTO = new DinnerRouteTeamWithDistanceTO(a, distance, isCurrentTeam);
      result.add(dinnerRouteTeamWithDistanceTO);
      if (teamWithLargestDistance == null || (distance != null && distance > teamWithLargestDistance.getDistanceToNextTeam())) {
        teamWithLargestDistance = dinnerRouteTeamWithDistanceTO;
      }
    }

    if (teamWithLargestDistance != null) {
      teamWithLargestDistance.setLargestDistanceInRoute(true);
    }

    return result;
  }
}
