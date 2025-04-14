import { TeamDistanceCluster, DinnerRouteTeamMapEntry, TeamDistanceClusterWithMapEntry, Team } from "../..";

export class TeamDistanceClusterEnhancer {

  public static enhanceTeamDistanceClustersWithDinnerRouteMapEntries(teamDistanceClusters: TeamDistanceCluster[], dinnerRouteMapEntries: DinnerRouteTeamMapEntry[]): TeamDistanceClusterWithMapEntry[] {
    return teamDistanceClusters
            .map(teamDistanceCluster => TeamDistanceClusterEnhancer.enhanceSingleTeamDistanceCluster(teamDistanceCluster, dinnerRouteMapEntries));
  }
  
  private static enhanceSingleTeamDistanceCluster(teamDistanceCluster: TeamDistanceCluster, dinnerRouteMapEntries: DinnerRouteTeamMapEntry[]): TeamDistanceClusterWithMapEntry {
    return {
      ...teamDistanceCluster,
      dinnerRouteMapEntries: TeamDistanceClusterEnhancer.mapToDinnerRouteMapEntries(teamDistanceCluster.teams, dinnerRouteMapEntries)
    }; 
  }
  
  private static mapToDinnerRouteMapEntries(teams: Team[], dinnerRouteMapEntries: DinnerRouteTeamMapEntry[]): DinnerRouteTeamMapEntry[] {
    const result = new Array<DinnerRouteTeamMapEntry>();
    for (let i = 0; i < teams.length; i++) {
      const team = teams[i];
      const dinnerRouteMapEntry = dinnerRouteMapEntries.find(entry => entry.teamNumber === team.teamNumber);
      if (dinnerRouteMapEntry) {
        result.push(dinnerRouteMapEntry);
      }
    }
    return result;
  }
}